const express = require('express');
const FAQ = require('../models/FAQ');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET all FAQs by department or category
router.get('/', async (req, res, next) => {
  try {
    const { department, category } = req.query;
    const filter = {};
    if (department && department !== 'All') filter.department = department;
    if (category && category !== 'All') filter.category = category;

    const faqs = await FAQ.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;