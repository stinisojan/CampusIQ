const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    uploaderName: {
      type: String,
      default: 'Admin',
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: [
        'General',
        'Admissions',
        'Academics',
        'Examinations',
        'Hostel',
        'Placements',
        'Scholarships',
        'Library',
        'Clubs & Events',
        'Campus Policies',
      ],
    },
    storagePath: {
      type: String,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ['UPLOADED', 'CHUNKING', 'EMBEDDING', 'INDEXED', 'FAILED'],
      default: 'UPLOADED',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
