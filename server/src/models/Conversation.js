const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Campus Query',
      trim: true,
    },
    departmentFilter: {
      type: String,
      default: '',
    },
    categoryFilter: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
