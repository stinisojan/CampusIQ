require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const User = require('../models/User');
const Document = require('../models/Document');
const { uploadDocument } = require('../services/documentService');

const seedDocuments = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('[SeedDocs] Connected to MongoDB');

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Dean Mitchell',
        email: 'admin@campusiq.edu',
        password: 'adminpassword123',
        role: 'admin',
        department: 'Administration',
      });
    }

    const sampleDir = path.resolve(__dirname, '../../../sample-documents');
    if (!fs.existsSync(sampleDir)) {
      console.error('[SeedDocs] sample-documents directory not found at', sampleDir);
      process.exit(1);
    }

    const files = fs.readdirSync(sampleDir);
    console.log(`[SeedDocs] Found ${files.length} sample document(s) in ${sampleDir}`);

    const uploadDir = path.resolve(process.cwd(), config.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const filename of files) {
      const srcPath = path.join(sampleDir, filename);
      const destPath = path.join(uploadDir, `seed_${Date.now()}_${filename}`);
      fs.copyFileSync(srcPath, destPath);

      const stats = fs.statSync(destPath);
      const mockFile = {
        filename: path.basename(destPath),
        originalname: filename.replace(/_/g, ' ').replace(/\.txt$/, ''),
        size: stats.size,
        mimetype: 'text/plain',
        path: destPath,
      };

      let category = 'General';
      let department = 'General';
      if (filename.includes('Admissions')) {
        category = 'Admissions';
        department = 'Admissions';
      } else if (filename.includes('Hostel')) {
        category = 'Hostel';
        department = 'Student Affairs';
      } else if (filename.includes('Curriculum') || filename.includes('Computer')) {
        category = 'Academics';
        department = 'Computer Science';
      }

      console.log(`[SeedDocs] Ingesting: ${filename}...`);
      const doc = await uploadDocument(mockFile, admin, { department, category });
      console.log(`[SeedDocs] Queued document ID: ${doc._id}`);
    }

    console.log('[SeedDocs] Sample documents successfully queued for ingestion.');
    // Give ingestion a few seconds to finish chunking and embedding
    await new Promise((r) => setTimeout(r, 3000));
    process.exit(0);
  } catch (err) {
    console.error('[SeedDocs] Error seeding sample documents:', err.message);
    process.exit(1);
  }
};

seedDocuments();
