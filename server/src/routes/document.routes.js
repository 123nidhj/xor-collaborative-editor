import express from 'express';
import Document from '../models/Document.js';
import User from '../models/User.js';
import History from '../models/History.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to check user access rights
const checkDocumentAccess = (doc, userId) => {
  const userIdStr = userId.toString();
  const isOwner = doc.owner.toString() === userIdStr;
  const collaborator = doc.collaborators.find(
    (c) => c.user && (c.user._id ? c.user._id.toString() : c.user.toString()) === userIdStr
  );
  const isEditor = isOwner || (collaborator && collaborator.role === 'editor');
  const isViewer = isEditor || (collaborator && collaborator.role === 'viewer') || doc.isPublic;

  return { isOwner, isEditor, isViewer, role: isOwner ? 'owner' : (collaborator ? collaborator.role : (doc.isPublic ? 'viewer' : 'none')) };
};

// @route   GET /api/documents
// @desc    Get all documents for the authenticated user (owned + shared)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const documents = await Document.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
      ],
    })
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor')
      .populate('lastModifiedBy', 'name email avatarColor')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/documents
// @desc    Create a new document room
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, content, language } = req.body;

    const document = await Document.create({
      title: title || 'Untitled Document',
      content: content || '',
      language: language || 'javascript',
      owner: req.user._id,
      lastModifiedBy: req.user._id,
      version: 1,
    });

    // Create initial revision snapshot
    await History.create({
      documentId: document._id,
      version: 1,
      content: document.content,
      savedBy: req.user._id,
      summary: 'Initial document creation',
    });

    const populatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor');

    res.status(201).json({
      success: true,
      document: populatedDoc,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor')
      .populate('lastModifiedBy', 'name email avatarColor');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const { isViewer, role } = checkDocumentAccess(document, req.user._id);
    if (!isViewer) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this document',
      });
    }

    res.status(200).json({
      success: true,
      role,
      document,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document metadata or content via REST
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const { isEditor } = checkDocumentAccess(document, req.user._id);
    if (!isEditor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this document',
      });
    }

    const { title, content, language, isPublic } = req.body;

    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (language !== undefined) document.language = language;
    if (isPublic !== undefined) document.isPublic = isPublic;

    document.lastModifiedBy = req.user._id;
    document.version += 1;

    await document.save();

    // Create periodic snapshot
    if (content !== undefined && document.version % 5 === 0) {
      await History.create({
        documentId: document._id,
        version: document.version,
        content: document.content,
        savedBy: req.user._id,
        summary: `Version ${document.version} update`,
      });
    }

    const updatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor')
      .populate('lastModifiedBy', 'name email avatarColor');

    res.status(200).json({
      success: true,
      document: updatedDoc,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document (Owner only)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const { isOwner } = checkDocumentAccess(document, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the document owner can delete this document',
      });
    }

    await Document.findByIdAndDelete(req.params.id);
    await History.deleteMany({ documentId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Document and revision history successfully deleted',
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/documents/:id/share
// @desc    Share document with another user by email
// @access  Private
router.post('/:id/share', protect, async (req, res, next) => {
  try {
    const { email, role = 'editor' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the collaborator email address',
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const { isOwner } = checkDocumentAccess(document, req.user._id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the document owner can manage collaborators',
      });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with that email address',
      });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You are already the owner of this document',
      });
    }

    // Check if already in collaborators
    const existingIndex = document.collaborators.findIndex(
      (c) => c.user.toString() === targetUser._id.toString()
    );

    if (existingIndex > -1) {
      document.collaborators[existingIndex].role = role;
    } else {
      document.collaborators.push({
        user: targetUser._id,
        role,
        addedAt: new Date(),
      });
    }

    await document.save();

    const updatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email avatarColor')
      .populate('collaborators.user', 'name email avatarColor');

    res.status(200).json({
      success: true,
      message: `Document shared with ${targetUser.name} (${targetUser.email})`,
      document: updatedDoc,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/documents/:id/history
// @desc    Get revision history for a document
// @access  Private
router.get('/:id/history', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { isViewer } = checkDocumentAccess(document, req.user._id);
    if (!isViewer) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const history = await History.find({ documentId: req.params.id })
      .populate('savedBy', 'name email avatarColor')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      history,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
