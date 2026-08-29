const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    filename: {
      type: String,
      default: '',
    },
    snippet: {
      type: String,
      default: '',
    },
    page: {
      type: String,
      default: '1',
    },
    section: {
      type: String,
      default: 'General',
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [sourceSchema],
    feedback: {
      type: String,
      enum: ['up', 'down', 'none'],
      default: 'none',
    },
    feedbackComment: {
      type: String,
      default: '',
    },
    llmProvider: {
      type: String,
      default: 'gemini',
    },
    embeddingProvider: {
      type: String,
      default: 'gemini',
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
