const QueryLog = require('../models/QueryLog');
const Document = require('../models/Document');
const Message = require('../models/Message');

const getOverviewAnalytics = async () => {
  const totalQueries = await QueryLog.countDocuments();
  const answeredQueries = await QueryLog.countDocuments({ wasAnswered: true });
  const unansweredQueries = await QueryLog.countDocuments({ wasAnswered: false });
  const totalDocuments = await Document.countDocuments({ processingStatus: 'INDEXED' });

  // Feedback breakdown
  const thumbsUpCount = await Message.countDocuments({ feedback: 'up' });
  const thumbsDownCount = await Message.countDocuments({ feedback: 'down' });

  // Average confidence score & latency
  const aggregateStats = await QueryLog.aggregate([
    {
      $group: {
        _id: null,
        avgConfidence: { $avg: '$topScore' },
        avgLatency: { $avg: '$latencyMs' },
      },
    },
  ]);

  const avgConfidence = aggregateStats[0]?.avgConfidence || 0;
  const avgLatency = aggregateStats[0]?.avgLatency || 0;

  // Recent queries
  const recentQueries = await QueryLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('userId', 'name email')
    .lean();

  return {
    totalQueries,
    answeredQueries,
    unansweredQueries,
    answerRate: totalQueries > 0 ? ((answeredQueries / totalQueries) * 100).toFixed(1) : '100.0',
    totalDocuments,
    feedback: {
      thumbsUp: thumbsUpCount,
      thumbsDown: thumbsDownCount,
      satisfactionRate:
        thumbsUpCount + thumbsDownCount > 0
          ? ((thumbsUpCount / (thumbsUpCount + thumbsDownCount)) * 100).toFixed(1)
          : '100.0',
    },
    avgConfidence: (avgConfidence * 100).toFixed(1),
    avgLatencyMs: Math.round(avgLatency),
    recentQueries,
  };
};

const getUnansweredQueries = async (limit = 30) => {
  const queries = await QueryLog.find({ wasAnswered: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();

  return queries;
};

module.exports = {
  getOverviewAnalytics,
  getUnansweredQueries,
};
