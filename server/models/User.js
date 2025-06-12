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
      timeTaken: Number,
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

const userSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, required: true },
  category: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
})

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["learner", "mentor"], required: true },

    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    location: String,
    experience: Number, 
    education: String,

    skills: [userSkillSchema],

    expertise: [String],
    mentorRating: { type: Number, default: 0 },
    totalMentees: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    skillDNA: [skillDNASchema],
    behavioralProfile: behavioralProfileSchema,

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

    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    lastBehavioralAssessment: Date,
    lastSkillAssessment: Date,
    assessmentStreak: { type: Number, default: 0 },

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
