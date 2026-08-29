const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FAQ', faqSchema);