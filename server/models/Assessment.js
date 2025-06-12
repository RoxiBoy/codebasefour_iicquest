import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
  questionId: String,
  type: { type: String, enum: ["behavioral", "technical", "communication"] },
  category: String, 
  question: String,
  options: [String], 
  correctAnswer: String, 
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  timeLimit: Number, 
  metadata: mongoose.Schema.Types.Mixed,
})

const responseSchema = new mongoose.Schema({
  questionId: String,
  userResponse: String,
  isCorrect: Boolean,
  timeTaken: Number, 
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

     
    sessionId: String,
    startTime: Date,
    endTime: Date,
    totalDuration: Number, 

    questions: [questionSchema],
    responses: [responseSchema],

    rawScore: Number,
    normalizedScore: Number,
    percentile: Number,

    aiAnalysisData: {
      responsePatterns: mongoose.Schema.Types.Mixed,
      timingAnalysis: mongoose.Schema.Types.Mixed,
      behavioralMetrics: mongoose.Schema.Types.Mixed,
      skillIndicators: mongoose.Schema.Types.Mixed,
    },

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

    status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress" },
    isProcessed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Assessment", assessmentSchema)
