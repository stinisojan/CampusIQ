const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      default: '1',
    },
    section: {
      type: String,
      default: 'General',
    },
    vectorId: {
      type: String,
      required: true,
      index: true,
    },
    embedding: {
      type: [Number], // Array of floats
      select: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    filename: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chunk', chunkSchema);
