const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const QueryLog = require('../models/QueryLog');
const { rewriteQueryWithHistory } = require('../rag/queryAgent');
const { retrieveRelevantChunks } = require('../rag/retrieverAgent');
const { assembleContext } = require('../rag/contextAssembler');
const { generateAnswer } = require('../rag/answerAgent');
const { emitMessageToken, emitMessageComplete } = require('../config/socket');
const config = require('../config/env');

/**
 * Creates a new conversation for a user
 */
const createConversation = async (userId, title = 'New Campus Query', filters = {}) => {
  const conversation = await Conversation.create({
    owner: userId,
    title: title.slice(0, 80),
    departmentFilter: filters.department || '',
    categoryFilter: filters.category || '',
  });
  return conversation;
};

/**
 * Lists conversations for a user
 */
const getUserConversations = async (userId) => {
  return await Conversation.find({ owner: userId }).sort({ lastMessageAt: -1 });
};

/**
 * Gets conversation by ID with all messages
 */
const getConversationWithMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, owner: userId });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
  return { conversation, messages };
};

/**
 * Executes the full RAG query lifecycle on a user message
 */
const sendMessage = async (conversationId, content, user, options = {}) => {
  const startTime = Date.now();
  const conversation = await Conversation.findOne({ _id: conversationId, owner: user._id || user.id });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Save User Message
  const userMessage = await Message.create({
    conversationId: conversation._id,
    role: 'user',
    content: content.trim(),
  });

  // Update conversation title if first user query
  const messageCount = await Message.countDocuments({ conversationId: conversation._id });
  if (messageCount <= 2 && conversation.title === 'New Campus Query') {
    conversation.title = content.slice(0, 45).trim() + (content.length > 45 ? '...' : '');
  }
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // 2. Fetch past conversation turns for context
  const pastMessages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const history = pastMessages.reverse().map((m) => ({ role: m.role, content: m.content }));

  // 3. Query Agent: Rewrite follow-up query into standalone search query
  const rewrittenQuery = await rewriteQueryWithHistory(content, history.slice(0, -1));

  // 4. Retriever Agent: Retrieve top-k chunks matching query
  const departmentFilter = options.department || conversation.departmentFilter;
  const { chunks, topScore } = await retrieveRelevantChunks(rewrittenQuery, {
    department: departmentFilter,
    topK: config.TOP_K_RESULTS || 4,
    minScore: config.SIMILARITY_THRESHOLD || 0.45,
  });

  // 5. Context Assembler: Deduplicate & format context
  const { contextText, sources, hasContext } = assembleContext(chunks);

  // 6. Answer Agent: Stream tokens via Socket.IO
  const tempAssistantMessageId = `temp_${Date.now()}`;

  const { answer, wasAnswered, provider } = await generateAnswer(
    content,
    contextText,
    hasContext,
    (token) => {
      emitMessageToken(conversation._id, token, tempAssistantMessageId);
    }
  );

  // 7. Save Assistant Message in DB
  const assistantMessage = await Message.create({
    conversationId: conversation._id,
    role: 'assistant',
    content: answer,
    sources: hasContext ? sources : [],
    confidenceScore: topScore,
    llmProvider: provider,
    embeddingProvider: config.EMBEDDING_PROVIDER,
  });

  // Emit completed message payload over WebSockets
  emitMessageComplete(conversation._id, assistantMessage);

  // 8. Log Query for Admin Analytics
  const latencyMs = Date.now() - startTime;
  try {
    await QueryLog.create({
      question: content,
      userId: user._id || user.id,
      conversationId: conversation._id,
      matchedDocuments: sources.map((s) => ({
        documentId: s.documentId,
        filename: s.filename,
        score: s.score,
      })),
      topScore,
      wasAnswered,
      department: departmentFilter || 'General',
      latencyMs,
    });
  } catch (logErr) {
    console.warn('[ConversationService] QueryLog error:', logErr.message);
  }

  return {
    userMessage,
    assistantMessage,
  };
};

/**
 * Submit feedback (thumbs up / down) for an assistant message
 */
const submitFeedback = async (messageId, userId, feedback, comment = '') => {
  const message = await Message.findById(messageId);
  if (!message) {
    const error = new Error('Message not found.');
    error.statusCode = 404;
    throw error;
  }

  message.feedback = feedback; // 'up' | 'down' | 'none'
  if (comment) message.feedbackComment = comment;
  await message.save();

  return message;
};

/**
 * Delete a conversation and all its messages
 */
const deleteConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findOneAndDelete({ _id: conversationId, owner: userId });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }
  await Message.deleteMany({ conversationId });
  return { success: true, message: 'Conversation deleted.' };
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationWithMessages,
  sendMessage,
  submitFeedback,
  deleteConversation,
};
