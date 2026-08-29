# Multi-stage production build for backend & frontend orchestration
FROM node:18-alpine AS base
WORKDIR /app

# Install Backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Install Frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy full application code
COPY backend ./backend
COPY frontend ./frontend

# Build Frontend Next.js app
RUN cd frontend && npm run build

EXPOSE 3000 5000

CMD ["sh", "-c", "node backend/src/server.js & npm --prefix frontend start"]