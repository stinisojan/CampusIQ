const analyticsService = require('../services/analyticsService');

const getOverview = async (req, res, next) => {
  try {
    const stats = await analyticsService.getOverviewAnalytics();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

const getUnanswered = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const queries = await analyticsService.getUnansweredQueries(limit);
    res.status(200).json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUnanswered,
};
