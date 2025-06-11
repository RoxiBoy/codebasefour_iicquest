const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChallengeAttemptSchema = new Schema({
  id: { type: String, required: true, unique: true },  // UUID string
  user_id: { type: String, required: true, ref: 'User' },
  challenge_id: { type: String, required: true, ref: 'Challenge' },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  answer: { type: String, required: true },
  confidence: { type: Number, required: true },
  ai_score: { type: Number, required: true },
  notes: { type: String, default: '' },
  skill_vector_delta: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model('ChallengeAttempt', ChallengeAttemptSchema);
