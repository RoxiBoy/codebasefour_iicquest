const mongoose = require('mongoose');
const { Schema } = mongoose;

const SkillVectorSchema = new Schema({
  user_id: { type: String, required: true, ref: 'User' },
  logical_reasoning: { type: Number, default: 0 },
  creativity: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  collaboration: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SkillVector', SkillVectorSchema);
