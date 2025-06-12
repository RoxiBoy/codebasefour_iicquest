import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
  questionId: String,
  type: { type: String, enum: ["behavioral", "technical", "communication"] },
  category: String, // math, reasoning, leadership, etc.
  question: String,
  options: [String], // for multiple choice
  correctAnswer: String, // for technical questions
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  timeLimit: Number, // in seconds
  metadata: mongoose.Schema.Types.Mixed,
})

const responseSchema = new mongoose.Schema({
  questionId: String,
  userResponse: String,
  isCorrect: Boolean,
  timeTaken: Number, // in milliseconds
  startTime: Date,
  endTime: Date,
  interactionData: {
    clickCount: Number,
    keystrokes: Number,
    pauseDuration: Number,
    revisited: Boolean,
    confidenceLevel: Number,
  },
  behavioralIndicators: {
    hesitationTime: Number,
    responsePattern: String,
    changesMade: Number,
  },
})

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["behavioral", "technical", "communication"], required: true },
    category: String,

    // Assessment session data
    sessionId: String,
    startTime: Date,
    endTime: Date,
    totalDuration: Number, // in seconds

    // Questions and responses
    questions: [questionSchema],
    responses: [responseSchema],

    // Scoring and analysis
    rawScore: Number,
    normalizedScore: Number,
    percentile: Number,

    // AI Model Input Data
    aiAnalysisData: {
      responsePatterns: mongoose.Schema.Types.Mixed,
      timingAnalysis: mongoose.Schema.Types.Mixed,
      behavioralMetrics: mongoose.Schema.Types.Mixed,
      skillIndicators: mongoose.Schema.Types.Mixed,
    },

    // Results
    skillsAssessed: [
      {
        skillName: String,
        score: Number,
        confidence: Number,
      },
    ],

    recommendations: [String],
    areasForImprovement: [String],
    strengths: [String],

    // Status
    status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress" },
    isProcessed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Assessment", assessmentSchema)
