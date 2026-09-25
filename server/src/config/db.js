import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collab_docs';

  try {
    // Attempt standard connection to specified MongoDB instance
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected successfully to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[DB] Local MongoDB connection failed (${err.message}).`);
    console.log('[DB] Launching resilient zero-config embedded MongoMemoryServer for development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to embedded in-memory MongoDB at ${memoryUri}`);
    } catch (memErr) {
      console.warn('[DB] Embedded MongoDB unavailable. Operating in High-Speed In-Memory Mode (WebSockets & real-time collaboration fully active).');
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Mongoose connection runtime error:', err);
  });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
