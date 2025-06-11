const mongoose = require('mongoose');
const { Schema } = mongoose;

const BehaviorVectorSchema = new Schema({
  user_id: { type: String, required: true, ref: 'User' },
  cognitive_style: { type: String, enum: ['analytical', 'holistic'], required: true },
  learning_mode: { type: String, enum: ['active', 'reflective'], required: true },
  communication: { type: String, enum: ['direct', 'nuanced'], required: true },
  motivation: { type: String, enum: ['intrinsic', 'extrinsic'], required: true },
  dominant_trait: { type: String, enum: ['leader', 'collaborator', 'independent'], required: true }
});

module.exports = mongoose.model('BehaviorVector', BehaviorVectorSchema);
