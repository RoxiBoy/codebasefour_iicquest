import mongoose from "mongoose"

const opportunitySchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["job", "internship", "project", "mentorship"], required: true },

    
    requiredSkills: [
      {
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
        skillName: String,
        minimumLevel: Number,
        weight: Number, 
      },
    ],

    experienceLevel: { type: String, enum: ["entry", "mid", "senior", "expert"] },

    location: String,
    isRemote: { type: Boolean, default: false },
    salaryRange: {
      min: Number,
      max: Number,
      currency: String,
    },
    duration: String, 

 
    applications: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending" },
        matchScore: Number,
        coverLetter: String,
      },
    ],

    
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    deadline: Date,
    maxApplicants: Number,
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Opportunity", opportunitySchema)
