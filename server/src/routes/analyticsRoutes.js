const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Admin-only protection
router.use(protect, requireAdmin);

router.get('/overview', analyticsController.getOverview);
router.get('/unanswered', analyticsController.getUnanswered);

module.exports = router;
