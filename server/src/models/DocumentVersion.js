const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changeSummary: {
      type: String,
      default: 'Initial upload',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);