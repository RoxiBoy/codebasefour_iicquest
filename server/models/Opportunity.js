import mongoose from "mongoose"

const opportunitySchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Basic Information
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["job", "internship", "project", "mentorship"], required: true },

    // Requirements
    requiredSkills: [
      {
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
        skillName: String,
        minimumLevel: Number,
        weight: Number, // importance of this skill
      },
    ],

    experienceLevel: { type: String, enum: ["entry", "mid", "senior", "expert"] },

    // Details
    location: String,
    isRemote: { type: Boolean, default: false },
    salaryRange: {
      min: Number,
      max: Number,
      currency: String,
    },
    duration: String, // for internships/projects

    // Application data
    applications: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending" },
        matchScore: Number,
        coverLetter: String,
      },
    ],

    // Status
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    deadline: Date,
    maxApplicants: Number,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Opportunity", opportunitySchema)
