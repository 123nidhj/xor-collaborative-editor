import mongoose from 'mongoose';

const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'Untitled Document',
    },
    content: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'markdown', 'html', 'json', 'plaintext'],
      default: 'javascript',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaborators: [collaboratorSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user documents quickly
documentSchema.index({ owner: 1, updatedAt: -1 });
documentSchema.index({ 'collaborators.user': 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
