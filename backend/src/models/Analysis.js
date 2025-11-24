import mongoose from "mongoose";

const topicPrioritySchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
    },
    frequency: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 100 
    },
    weightage: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 100 
    },
    priority: { 
        type: String, 
        enum: ["high", "medium", "low"], 
        required: true 
    },
    confidence: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 1 
    },
    trend: {
        type: String,
        enum: ["increasing", "decreasing", "stable"],
        required: true,
    },
    lastAppeared: Number,
    recommendedStudyTime: String,
});

const generatedQuestionSchema = new mongoose.Schema({
    id: { type: String, 
        required: true 
    },
    question: { 
        type: String, 
        required: true 
    },
    type: {
    type: String,
    enum: ["definition", "application", "derivation", "problem"],
    required: true,
  },
    marks: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
    topic: { 
        type: String, 
        required: true 
    },
    learningOutcome: { 
        type: String, 
        required: true 
    },
    modelUsed: { 
        type: String, 
        required: true 
    },
    estimatedTime: { 
        type: Number, 
        required: true, min: 1 
    },
});

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      index: true,
    },
    importantTopics: [topicPrioritySchema],
    generatedQuestions: [generatedQuestionSchema],
    summary: {
      overview: String,
      keyConcepts: [String],
      studyRecommendations: [String],
      estimatedPreparationTime: String,
    },
    metadata: {
      processingTime: Number,
      totalDocuments: Number,
      modelVersion: String,
      cacheHit: Boolean,
      tokensUsed: Number,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ subjectId: 1, status: 1 });


export default mongoose.model("Analysis", analysisSchema);
