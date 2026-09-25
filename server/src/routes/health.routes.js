import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'collab-docs-api',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'collab_docs',
    },
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
