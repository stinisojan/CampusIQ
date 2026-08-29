const conversationService = require('../services/conversationService');

const listConversations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversations = await conversationService.getUserConversations(userId);
    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, department, category } = req.body;
    const conversation = await conversationService.createConversation(userId, title, { department, category });
    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await conversationService.getConversationWithMessages(req.params.id, userId);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { content, department } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const result = await conversationService.sendMessage(
      req.params.id,
      content,
      req.user,
      { department }
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { feedback, comment } = req.body;
    if (!['up', 'down', 'none'].includes(feedback)) {
      return res.status(400).json({ success: false, message: 'Feedback must be up, down, or none.' });
    }

    const message = await conversationService.submitFeedback(
      req.params.id,
      req.user.id || req.user._id,
      feedback,
      comment
    );

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await conversationService.deleteConversation(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  sendMessage,
  submitFeedback,
  deleteConversation,
};
