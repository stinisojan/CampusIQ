import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  isStreaming: false,
  streamingContent: '',
  error: null,
  selectedDepartment: 'All',

  suggestedQuestions: [
    'What are the eligibility criteria for Presidential Merit Scholarship?',
    'What are the hostel check-in hours and curfew rules?',
    'What is the minimum attendance required for CSE end-semester exams?',
    'What is the fee refund policy if I withdraw before orientation?',
    'What are the top recruiting companies for Computer Science?',
  ],

  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await api.get('/conversations');
      const conversations = response.data.conversations || [];
      set({
        conversations,
        isLoadingConversations: false,
      });

      // Auto-select first conversation if none selected
      const currentActive = get().activeConversationId;
      if (!currentActive && conversations.length > 0) {
        get().selectConversation(conversations[0]._id);
      }
    } catch (err) {
      console.error('[ChatStore] Error fetching conversations:', err);
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (conversationId) => {
    if (!conversationId) return;
    set({ activeConversationId: conversationId, isLoadingMessages: true, streamingContent: '', isStreaming: false });

    // Join Socket.IO conversation room
    const socket = getSocket();
    if (socket) {
      socket.emit('join:conversation', conversationId);
    }

    try {
      const response = await api.get(`/conversations/${conversationId}`);
      set({
        messages: response.data.messages || [],
        isLoadingMessages: false,
      });
    } catch (err) {
      console.error('[ChatStore] Error fetching conversation messages:', err);
      set({ isLoadingMessages: false, error: 'Failed to load messages.' });
    }
  },

  createConversation: async (title = 'New Campus Query') => {
    try {
      const dept = get().selectedDepartment;
      const response = await api.post('/conversations', {
        title,
        department: dept === 'All' ? '' : dept,
      });
      const newConv = response.data.conversation;

      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversationId: newConv._id,
        messages: [],
        streamingContent: '',
        isStreaming: false,
      }));

      // Join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('join:conversation', newConv._id);
      }

      return newConv;
    } catch (err) {
      console.error('[ChatStore] Error creating conversation:', err);
      throw err;
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      set((state) => {
        const remaining = state.conversations.filter((c) => c._id !== conversationId);
        const nextActive = state.activeConversationId === conversationId ? remaining[0]?._id || null : state.activeConversationId;
        return {
          conversations: remaining,
          activeConversationId: nextActive,
          messages: nextActive ? state.messages : [],
        };
      });

      if (get().activeConversationId) {
        get().selectConversation(get().activeConversationId);
      }
    } catch (err) {
      console.error('[ChatStore] Error deleting conversation:', err);
    }
  },

  sendMessage: async (text) => {
    const content = text.trim();
    if (!content) return;

    let convId = get().activeConversationId;
    if (!convId) {
      const newConv = await get().createConversation(content.slice(0, 40));
      convId = newConv._id;
    }

    // Optimistically push user message
    const tempUserMsg = {
      _id: `temp_user_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isSending: true,
      isStreaming: true,
      streamingContent: '',
    }));

    const socket = getSocket();
    let tokenBuffer = '';

    // Listen for streaming tokens
    const handleToken = (data) => {
      if (data.conversationId === convId) {
        tokenBuffer += data.token;
        set({ streamingContent: tokenBuffer });
      }
    };

    const handleComplete = (data) => {
      if (data.conversationId === convId && data.message) {
        if (socket) {
          socket.off('message:token', handleToken);
          socket.off('message:complete', handleComplete);
        }
        set((state) => {
          // Replace temp streaming state with real message from server
          const filtered = state.messages.filter((m) => m._id !== tempUserMsg._id);
          return {
            messages: [...filtered, tempUserMsg, data.message],
            isStreaming: false,
            streamingContent: '',
            isSending: false,
          };
        });
      }
    };

    if (socket) {
      socket.on('message:token', handleToken);
      socket.on('message:complete', handleComplete);
    }

    try {
      const dept = get().selectedDepartment;
      const response = await api.post(`/conversations/${convId}/messages`, {
        content,
        department: dept === 'All' ? '' : dept,
      });

      // Update active conversation in sidebar list
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === convId ? { ...c, lastMessageAt: new Date().toISOString(), title: c.title === 'New Campus Query' ? content.slice(0, 40) : c.title } : c
        ),
      }));

      // In case WebSocket didn't arrive, ensure assistant message is added
      setTimeout(() => {
        if (get().isStreaming) {
          if (socket) {
            socket.off('message:token', handleToken);
            socket.off('message:complete', handleComplete);
          }
          if (response.data?.assistantMessage) {
            set((state) => ({
              messages: [
                ...state.messages.filter((m) => m._id !== tempUserMsg._id),
                response.data.userMessage || tempUserMsg,
                response.data.assistantMessage,
              ],
              isStreaming: false,
              streamingContent: '',
              isSending: false,
            }));
          }
        }
      }, 800);
    } catch (err) {
      console.error('[ChatStore] Send message error:', err);
      if (socket) {
        socket.off('message:token', handleToken);
        socket.off('message:complete', handleComplete);
      }
      set({
        isSending: false,
        isStreaming: false,
        streamingContent: '',
        error: 'Failed to generate response. Please try again.',
      });
    }
  },

  submitFeedback: async (messageId, feedbackType) => {
    try {
      await api.post(`/messages/${messageId}/feedback`, { feedback: feedbackType });
      set((state) => ({
        messages: state.messages.map((m) => (m._id === messageId ? { ...m, feedback: feedbackType } : m)),
      }));
    } catch (err) {
      console.error('[ChatStore] Feedback error:', err);
    }
  },
}));
