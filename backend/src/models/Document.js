import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['syllabus', 'notes', 'pyq', 'textbook'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  content: {
    type: String,
    default: ''
  },
  metadata: {
    pages: Number,
    wordCount: Number,
    topics: [String],
    year: Number
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  filePath: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date
}, {
  timestamps: true
});

// Compound indexes for efficient queries
documentSchema.index({ userId: 1, subjectId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ processingStatus: 1 });

export default mongoose.model('Document', documentSchema);