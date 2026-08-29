# Use official Node.js lightweight image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]