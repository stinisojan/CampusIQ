const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./env');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all in dev, or config.FRONTEND_URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    // Optional auth token verification for personalized events
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        // Continue unauthenticated if token invalid (public channels still work)
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${socket.user?.id || 'Guest'})`);

    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.join('public');

    socket.on('join:conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined conversation:${conversationId}`);
      }
    });

    socket.on('leave:conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initSocket first.');
  }
  return io;
};

// Real-time helper functions
const emitDocumentStatus = (documentId, status, payload = {}) => {
  if (io) {
    io.emit('document:status', {
      documentId,
      status,
      timestamp: new Date(),
      ...payload,
    });
  }
};

const emitMessageToken = (conversationId, token, messageId) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:token', {
      conversationId,
      messageId,
      token,
    });
  }
};

const emitMessageComplete = (conversationId, message) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:complete', {
      conversationId,
      message,
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitDocumentStatus,
  emitMessageToken,
  emitMessageComplete,
};
