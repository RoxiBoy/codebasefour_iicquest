import mongoose from "mongoose"

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true }, 
    subcategory: String,
    description: String,

    demandLevel: { type: Number, min: 0, max: 100 },
    trendDirection: { type: String, enum: ["rising", "stable", "declining"] },
    averageSalaryImpact: Number,

    assessmentQuestions: [
      {
        questionId: String,
        difficulty: String,
        weight: Number,
      },
    ],

    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],

    learningResources: [
      {
        title: String,
        url: String,
        type: String, 
        difficulty: String,
        estimatedTime: Number, 
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Skill", skillSchema)
