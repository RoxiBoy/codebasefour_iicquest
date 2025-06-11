const mongoose = require('mongoose');
const { Schema } = mongoose;

const OpportunitySchema = new Schema({
  id: { type: String, required: true, unique: true },  // UUID string
  title: { type: String, required: true },
  description: { type: String, default: '' },
  required_skills: { type: [String], default: [] },
  role_type: { type: String, enum: ['internship', 'project', 'job'], required: true },
  compatibility_scores: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);
