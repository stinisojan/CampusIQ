const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const faqRoutes = require('./routes/faqRoutes');

const app = express();
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files securely
app.use('/uploads', express.static(path.resolve(process.cwd(), config.UPLOAD_DIR)));

// System Heartbeat / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'CampusIQ RAG API',
    version: '1.0.0',
    providers: {
      embedding: config.EMBEDDING_PROVIDER,
      llm: config.LLM_PROVIDER,
      vectorStore: config.VECTOR_STORE,
    },
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', conversationRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/faqs', faqRoutes); // Mounted FAQ Routes

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;