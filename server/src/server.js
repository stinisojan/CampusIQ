const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { getVectorStore } = require('./config/vectorStore');

const server = http.createServer(app);

// Initialize Socket.IO with server instance
const io = initSocket(server);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize vector store
    const vectorStore = getVectorStore();
    if (typeof vectorStore.init === 'function') {
      await vectorStore.init();
    }

    server.listen(config.PORT, () => {
      console.log(`
=====================================================
  🎓 CAMPUSIQ BACKEND SERVER STARTED
  ---------------------------------------------------
  • Mode:             ${config.NODE_ENV}
  • Port:             ${config.PORT}
  • Health Check:     http://localhost:${config.PORT}/api/health
  • LLM Provider:     ${config.LLM_PROVIDER} (${config.GEMINI_MODEL || config.OPENAI_MODEL})
  • Embedding:        ${config.EMBEDDING_PROVIDER}
  • Vector Store:     ${config.VECTOR_STORE}
=====================================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

startServer();
