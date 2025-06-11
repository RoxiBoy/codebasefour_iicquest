const ChallengeAttempt = require('../models/ChallengeAttempt'); // Adjust path as needed
const User = require('../models/User'); // Adjust path as needed
const Challenge = require('../models/Challenge'); // Adjust path as needed
const { v4: uuidv4 } = require('uuid');

class ChallengeAttemptController {
  static async createChallengeAttempt(req, res) {
    try {
      const { user_id, challenge_id, start_time, end_time, answer, confidence, ai_score, notes, skill_vector_delta } = req.body;

      if (!user_id || !challenge_id || !start_time || !end_time || !answer || !confidence || !ai_score) {
        return res.status(400).json({
          success: false,
          message: 'user_id, challenge_id, start_time, end_time, answer, confidence, and ai_score are required'
        });
      }

      // Validate user_id
      const user = await User.findOne({ id: user_id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Validate challenge_id
      const challenge = await Challenge.findOne({ id: challenge_id });
      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      // Validate confidence (assuming 0-100 range)
      if (confidence < 0 || confidence > 100) {
        return res.status(400).json({
          success: false,
          message: 'Confidence must be between 0 and 100'
        });
      }

      // Validate ai_score (assuming 0-100 range)
      if (ai_score < 0 || ai_score > 100) {
        return res.status(400).json({
          success: false,
          message: 'AI score must be between 0 and 100'
        });
      }

      const newChallengeAttempt = new ChallengeAttempt({
        id: uuidv4(),
        user_id,
        challenge_id,
        start_time,
        end_time,
        answer,
        confidence,
        ai_score,
        notes: notes || '',
        skill_vector_delta: skill_vector_delta || {}
      });

      const savedChallengeAttempt = await newChallengeAttempt.save();

      res.status(201).json({
        success: true,
        message: 'Challenge attempt created successfully',
        data: savedChallengeAttempt
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Challenge attempt with this ID already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllChallengeAttempts(req, res) {
    try {
      const { user_id, challenge_id, page = 1, limit = 10 } = req.query;

      const filter = {};
      if (user_id) filter.user_id = user_id;
      if (challenge_id) filter.challenge_id = challenge_id;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challengeAttempts = await ChallengeAttempt.find(filter)
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ start_time: -1 });

      const total = await ChallengeAttempt.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challengeAttempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttempts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getChallengeAttemptById(req, res) {
    try {
      const { id } = req.params;

      const challengeAttempt = await ChallengeAttempt.findOne({ id })
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type');

      if (!challengeAttempt) {
        return res.status(404).json({
          success: false,
          message: 'Challenge attempt not found'
        });
      }

      res.status(200).json({
        success: true,
        data: challengeAttempt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateChallengeAttempt(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates.id;
      delete updates._id;
      delete updates.user_id; // Prevent changing user_id
      delete updates.challenge_id; // Prevent changing challenge_id

      if (updates.confidence && (updates.confidence < 0 || updates.confidence > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Confidence must be between 0 and 100'
        });
      }

      if (updates.ai_score && (updates.ai_score < 0 || updates.ai_score > 100)) {
        return res.status(400).json({
          success: false,
          message: 'AI score must be between 0 and 100'
        });
      }

      const challengeAttempt = await ChallengeAttempt.findOneAndUpdate(
        { id },
        updates,
        { new: true, runValidators: true }
      ).populate('user_id', 'name email role')
       .populate('challenge_id', 'title type');

      if (!challengeAttempt) {
        return res.status(404).json({
          success: false,
          message: 'Challenge attempt not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge attempt updated successfully',
        data: challengeAttempt
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Challenge attempt with this ID already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async deleteChallengeAttempt(req, res) {
    try {
      const { id } = req.params;

      const challengeAttempt = await ChallengeAttempt.findOneAndDelete({ id })
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type');

      if (!challengeAttempt) {
        return res.status(404).json({
          success: false,
          message: 'Challenge attempt not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge attempt deleted successfully',
        data: challengeAttempt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getChallengeAttemptsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const user = await User.findOne({ id: user_id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challengeAttempts = await ChallengeAttempt.find({ user_id })
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ start_time: -1 });

      const total = await ChallengeAttempt.countDocuments({ user_id });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challengeAttempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttempts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getChallengeAttemptsByChallenge(req, res) {
    try {
      const { challenge_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const challenge = await Challenge.findOne({ id: challenge_id });
      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challengeAttempts = await ChallengeAttempt.find({ challenge_id })
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ start_time: -1 });

      const total = await ChallengeAttempt.countDocuments({ challenge_id });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challengeAttempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttempts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async searchChallengeAttempts(req, res) {
    try {
      const { query, page = 1, limit = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const searchRegex = new RegExp(query, 'i');
      const filter = {
        $or: [
          { answer: searchRegex },
          { notes: searchRegex }
        ]
      };

      const challengeAttempts = await ChallengeAttempt.find(filter)
        .populate('user_id', 'name email role')
        .populate('challenge_id', 'title type')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ start_time: -1 });

      const total = await ChallengeAttempt.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challengeAttempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttempts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = ChallengeAttemptController;
