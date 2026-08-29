const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');
const DocumentVersion = require('../models/DocumentVersion');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const config = require('../config/env');

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

router.use(protect);

router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.get('/:id/view', documentController.viewDocument);

// Get Document Version History
router.get('/:id/versions', async (req, res, next) => {
  try {
    const versions = await DocumentVersion.find({ documentId: req.params.id }).sort({ version: -1 });
    res.status(200).json({ success: true, versions });
  } catch (err) {
    next(err);
  }
});

// Admin Routes
router.post('/', requireAdmin, upload.single('file'), documentController.uploadDocument);
router.post('/batch', requireAdmin, upload.array('files', 10), documentController.uploadBatchDocuments);
router.post('/:id/reindex', requireAdmin, documentController.reindexDocument);
router.delete('/:id', requireAdmin, documentController.deleteDocument);

module.exports = router;