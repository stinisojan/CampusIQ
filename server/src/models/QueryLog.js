const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    matchedDocuments: [
      {
        documentId: mongoose.Schema.Types.ObjectId,
        filename: String,
        score: Number,
      },
    ],
    topScore: {
      type: Number,
      default: 0,
    },
    wasAnswered: {
      type: Boolean,
      default: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QueryLog', queryLogSchema);
