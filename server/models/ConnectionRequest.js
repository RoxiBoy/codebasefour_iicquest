import mongoose from "mongoose"

const ConnectionRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

ConnectionRequestSchema.index(
  { sender: 1, receiver: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
)

export default mongoose.model("ConnectionRequest", ConnectionRequestSchema)
