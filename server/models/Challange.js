const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChallengeSchema = new Schema({
  id: { type: String, required: true, unique: true },  // UUID string
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['logical', 'creative', 'collaborative'], required: true },
  expected_time: { type: Number, required: true },
  evaluator: { type: String, enum: ['auto', 'manual'], required: true },
  score_weights: {
    accuracy: { type: Number, required: true },
    speed: { type: Number, required: true },
    confidence: { type: Number, required: true }
  }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
