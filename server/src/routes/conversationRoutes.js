const express = require('express');
const conversationController = require('../controllers/conversationController');
const { protect } = require('../middlewares/authMiddleware');
const { chatLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Require auth for all chat routes
router.use(protect);

router.get('/conversations', conversationController.listConversations);
router.post('/conversations', conversationController.createConversation);
router.get('/conversations/:id', conversationController.getConversation);
router.post('/conversations/:id/messages', chatLimiter, conversationController.sendMessage);
router.delete('/conversations/:id', conversationController.deleteConversation);

// Feedback endpoint on /api/messages/:id/feedback
router.post('/messages/:id/feedback', conversationController.submitFeedback);

module.exports = router;
