import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const skillDNASchema = new mongoose.Schema({
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
  skillName: String,
  level: { type: Number, min: 0, max: 100 },
  lastAssessed: { type: Date, default: Date.now },
  growthRate: { type: Number, default: 0 },
  assessmentHistory: [
    {
      score: Number,
      date: Date,
      timeTaken: Number, // in seconds
      assessmentType: String,
    },
  ],
})

const behavioralProfileSchema = new mongoose.Schema({
  communicationStyle: String,
  workingStyle: String,
  leadershipTendency: Number,
  collaborationScore: Number,
  adaptabilityScore: Number,
  problemSolvingApproach: String,
  lastAssessed: { type: Date, default: Date.now },
  assessmentData: [
    {
      questionId: String,
      response: String,
      timeTaken: Number,
      confidence: Number,
      date: Date,
    },
  ],
})

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["learner", "mentor"], required: true },

    // Profile Information
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    location: String,
    experience: Number, // years
    education: String,

    // For Mentors
    expertise: [String],
    mentorRating: { type: Number, default: 0 },
    totalMentees: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // Skill DNA and Behavioral Profile
    skillDNA: [skillDNASchema],
    behavioralProfile: behavioralProfileSchema,

    // Learning and Activity Data
    learningGoals: [String],
    preferredLearningStyle: String,
    activityLog: [
      {
        action: String,
        timestamp: Date,
        duration: Number,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Matching and Connections
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Assessment tracking
    lastBehavioralAssessment: Date,
    lastSkillAssessment: Date,
    assessmentStreak: { type: Number, default: 0 },

    // Privacy and preferences
    isProfilePublic: { type: Boolean, default: true },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      opportunities: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model("User", userSchema)
