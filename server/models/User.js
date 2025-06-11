const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Required only for email auth_provider
  role: { type: String, enum: ['learner', 'mentor', 'provider'], required: true },
  auth_provider: { type: String, enum: ['google', 'email'], required: true },
  profile: {
    bio: { type: String, default: '' },
    education: { type: String, default: '' },
    interests: { type: [String], default: [] },
    preferred_industries: { type: [String], default: [] }
  },
  created_at: { type: Date, default: Date.now }
});

// Hash password before saving if auth_provider is email
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.auth_provider === 'email') {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
