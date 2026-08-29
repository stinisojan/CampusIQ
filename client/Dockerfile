# Step 1: Build Next.js Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Environment variables needed during Next.js static build phase
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Build Next.js web application
RUN npm run build

# Step 2: Production Execution Stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy standalone build assets from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start Next.js production server
CMD ["npm", "start"]