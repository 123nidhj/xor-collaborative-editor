import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    summary: {
      type: String,
      default: 'Auto-saved revision',
    },
  },
  {
    timestamps: true,
  }
);

historySchema.index({ documentId: 1, createdAt: -1 });

const History = mongoose.model('History', historySchema);
export default History;
