import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Server } = require('socket.io');

import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import healthRoutes from './src/routes/health.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { setupDocumentSocket } from './src/sockets/documentSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration supporting both local Vite dev server and custom origins
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Setup real-time document sync and presence
setupDocumentSocket(io);

// Mount modular REST routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SYNC/WAVE Collaborative Platform API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Catch 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`,
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const isTest = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));

if (!isTest) {
  connectDB()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(`  🚀 SYNC/WAVE Backend running on http://localhost:${PORT}`);
        console.log(`  ⚡ Socket.io real-time engine active`);
        console.log(`  🛡️  REST API: /api/auth, /api/documents, /api/health`);
        console.log(`======================================================\n`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server due to database connection error:', err);
      process.exit(1);
    });
}

export { app, server, io };
