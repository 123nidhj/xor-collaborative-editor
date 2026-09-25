# Backend Dockerfile for XOR Collaborative Editor
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend API & WebSocket port
EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "server.js"]
