import mongoose from "mongoose"

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true }, // Technical, Soft, Domain-specific
    subcategory: String,
    description: String,

    // Market data
    demandLevel: { type: Number, min: 0, max: 100 },
    trendDirection: { type: String, enum: ["rising", "stable", "declining"] },
    averageSalaryImpact: Number,

    // Assessment configuration
    assessmentQuestions: [
      {
        questionId: String,
        difficulty: String,
        weight: Number,
      },
    ],

    // Related skills
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],

    // Learning resources
    learningResources: [
      {
        title: String,
        url: String,
        type: String, // course, article, video, book
        difficulty: String,
        estimatedTime: Number, // in hours
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Skill", skillSchema)
