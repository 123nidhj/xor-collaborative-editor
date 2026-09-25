import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Document from '../models/Document.js';
import History from '../models/History.js';

// Map of documentId -> Map of socketId -> userInfo
const roomPresence = new Map();

// Map of documentId -> { timer, content, lastModifiedBy }
const pendingSaves = new Map();

// In-memory buffer for rooms
const roomContentBuffer = new Map();

const DEBOUNCE_SAVE_DELAY = 1200; // ms

const AVATAR_COLORS = [
  '#06b6d4', // Neon Cyan
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Sky Blue
];

// Helper to flush pending save immediately
const flushPendingSave = async (documentId, io) => {
  const pending = pendingSaves.get(documentId);
  if (!pending) return;

  clearTimeout(pending.timer);
  pendingSaves.delete(documentId);

  // Store in memory buffer
  roomContentBuffer.set(documentId, pending.content);

  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(documentId)) {
      const doc = await Document.findById(documentId);
      if (doc) {
        doc.content = pending.content;
        if (pending.lastModifiedBy) {
          doc.lastModifiedBy = pending.lastModifiedBy;
        }
        doc.version += 1;
        await doc.save();

        if (doc.version % 5 === 0) {
          await History.create({
            documentId: doc._id,
            version: doc.version,
            content: doc.content,
            savedBy: pending.lastModifiedBy,
            summary: `Auto-saved version ${doc.version}`,
          });
        }
      }
    }

    if (io) {
      io.to(`document:${documentId}`).emit('save-status', {
        status: 'saved',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[Socket] Error saving document ${documentId}:`, err);
    if (io) {
      io.to(`document:${documentId}`).emit('save-status', {
        status: 'error',
        message: 'Failed to persist changes',
      });
    }
  }
};

export const setupDocumentSocket = (io) => {
  // Socket authentication & identity middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_collab_platform_2026';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('name email avatarColor');
        if (user) {
          socket.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatarColor: user.avatarColor,
          };
          return next();
        }
      }

      // Guest fallback with distinct random avatar color
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      socket.user = {
        id: `guest_${socket.id.substring(0, 6)}`,
        name: `User ${socket.id.substring(0, 4)}`,
        email: 'collaborator@xor.local',
        avatarColor: color,
      };
      next();
    } catch {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      socket.user = {
        id: `guest_${socket.id.substring(0, 6)}`,
        name: `User ${socket.id.substring(0, 4)}`,
        email: 'collaborator@xor.local',
        avatarColor: color,
      };
      next();
    }
  });

  io.on('connection', (socket) => {
    let currentDocumentId = null;

    // Join a specific document room (with optional custom username)
    socket.on('join-document', async (documentId, options = {}) => {
      if (!documentId) return;

      currentDocumentId = documentId;
      const roomName = `document:${documentId}`;
      socket.join(roomName);

      if (options && options.username) {
        socket.user.name = options.username;
      }

      // Initialize presence map for this room if absent
      if (!roomPresence.has(documentId)) {
        roomPresence.set(documentId, new Map());
      }

      const activeUsers = roomPresence.get(documentId);
      const collaboratorInfo = {
        socketId: socket.id,
        userId: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        avatarColor: socket.user.avatarColor,
        cursor: null,
        joinedAt: new Date().toISOString(),
      };

      activeUsers.set(socket.id, collaboratorInfo);

      // Check current content in pending buffer, memory cache, or MongoDB
      let currentContent = null;
      if (pendingSaves.has(documentId)) {
        currentContent = pendingSaves.get(documentId).content;
      } else if (roomContentBuffer.has(documentId)) {
        currentContent = roomContentBuffer.get(documentId);
      } else if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(documentId)) {
        try {
          const doc = await Document.findById(documentId);
          if (doc) {
            currentContent = doc.content;
          }
        } catch (err) {
          console.warn('[Socket] Could not load document from DB:', err.message);
        }
      }

      // Send initial content to joining client
      if (currentContent !== null) {
        socket.emit('load-document', {
          content: currentContent,
          title: documentId,
        });
      }

      // Broadcast updated presence list to everyone in the room
      const presenceList = Array.from(activeUsers.values());
      io.to(roomName).emit('room-collaborators', presenceList);

      // Notify others in room
      socket.to(roomName).emit('user-joined', {
        name: socket.user.name,
        avatarColor: socket.user.avatarColor,
      });
    });

    // Real-time changes broadcast & debounced saving
    socket.on('send-changes', ({ documentId, content, delta, version }) => {
      if (!documentId) return;

      const roomName = `document:${documentId}`;

      // Update in-memory room buffer
      roomContentBuffer.set(documentId, content);

      // 1. Instantly forward to other room participants (excluding sender)
      socket.to(roomName).emit('receive-changes', {
        content,
        delta,
        version,
        senderSocketId: socket.id,
        senderUser: socket.user,
      });

      // 2. Broadcast syncing status
      io.to(roomName).emit('save-status', {
        status: 'saving',
        timestamp: new Date().toISOString(),
      });

      // 3. Debounce save
      if (pendingSaves.has(documentId)) {
        clearTimeout(pendingSaves.get(documentId).timer);
      }

      const timer = setTimeout(() => {
        flushPendingSave(documentId, io);
      }, DEBOUNCE_SAVE_DELAY);

      pendingSaves.set(documentId, {
        timer,
        content,
        lastModifiedBy: socket.user.id.startsWith('guest') ? null : socket.user.id,
      });
    });

    // Live cursor position tracking
    socket.on('cursor-move', ({ documentId, line, ch, selection }) => {
      if (!documentId) return;

      const activeUsers = roomPresence.get(documentId);
      if (activeUsers && activeUsers.has(socket.id)) {
        const user = activeUsers.get(socket.id);
        user.cursor = { line, ch, selection };
      }

      socket.to(`document:${documentId}`).emit('cursor-update', {
        socketId: socket.id,
        userId: socket.user.id,
        name: socket.user.name,
        avatarColor: socket.user.avatarColor,
        line,
        ch,
        selection,
      });
    });

    // Handle user disconnect or leaving room
    const handleLeave = () => {
      if (!currentDocumentId) return;

      const documentId = currentDocumentId;
      const roomName = `document:${documentId}`;
      socket.leave(roomName);

      const activeUsers = roomPresence.get(documentId);
      if (activeUsers) {
        activeUsers.delete(socket.id);

        if (activeUsers.size === 0) {
          roomPresence.delete(documentId);
          flushPendingSave(documentId, io);
        } else {
          io.to(roomName).emit('room-collaborators', Array.from(activeUsers.values()));
          socket.to(roomName).emit('user-left', {
            socketId: socket.id,
            name: socket.user.name,
          });
        }
      }
    };

    socket.on('leave-document', handleLeave);
    socket.on('disconnecting', handleLeave);
  });
};
