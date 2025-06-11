const Challenge = require('../models/Challange'); // Adjust path as needed
const { v4: uuidv4 } = require('uuid');

class ChallengeController {
  static async createChallenge(req, res) {
    try {
      const { title, description, type, expected_time, evaluator, score_weights } = req.body;

      if (!title || !type || !expected_time || !evaluator || !score_weights) {
        return res.status(400).json({
          success: false,
          message: 'Title, type, expected_time, evaluator, and score_weights are required'
        });
      }

      if (!['logical', 'creative', 'collaborative'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be one of: logical, creative, collaborative'
        });
      }

      if (!['auto', 'manual'].includes(evaluator)) {
        return res.status(400).json({
          success: false,
          message: 'Evaluator must be one of: auto, manual'
        });
      }

      if (!score_weights.accuracy || !score_weights.speed || !score_weights.confidence) {
        return res.status(400).json({
          success: false,
          message: 'Score weights must include accuracy, speed, and confidence'
        });
      }

      const existingChallenge = await Challenge.findOne({ title });
      if (existingChallenge) {
        return res.status(409).json({
          success: false,
          message: 'Challenge with this title already exists'
        });
      }

      const newChallenge = new Challenge({
        id: uuidv4(),
        title,
        description: description || '',
        type,
        expected_time,
        evaluator,
        score_weights
      });

      const savedChallenge = await newChallenge.save();

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        data: savedChallenge
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Challenge with this ID already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllChallenges(req, res) {
    try {
      const { type, evaluator, page = 1, limit = 10 } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (evaluator) filter.evaluator = evaluator;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challenges = await Challenge.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Challenge.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalChallenges: total,
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

  static async getChallengeById(req, res) {
    try {
      const { id } = req.params;

      const challenge = await Challenge.findOne({ id });

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        data: challenge
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateChallenge(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates.id;
      delete updates._id;

      if (updates.type && !['logical', 'creative', 'collaborative'].includes(updates.type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be one of: logical, creative, collaborative'
        });
      }

      if (updates.evaluator && !['auto', 'manual'].includes(updates.evaluator)) {
        return res.status(400).json({
          success: false,
          message: 'Evaluator must be one of: auto, manual'
        });
      }

      if (updates.score_weights) {
        if (!updates.score_weights.accuracy || !updates.score_weights.speed || !updates.score_weights.confidence) {
          return res.status(400).json({
            success: false,
            message: 'Score weights must include accuracy, speed, and confidence'
          });
        }
      }

      const challenge = await Challenge.findOneAndUpdate(
        { id },
        updates,
        { new: true, runValidators: true }
      );

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge updated successfully',
        data: challenge
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Challenge with this title already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async deleteChallenge(req, res) {
    try {
      const { id } = req.params;

      const challenge = await Challenge.findOneAndDelete({ id });

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully',
        data: challenge
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getChallengesByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['logical', 'creative', 'collaborative'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Must be one of: logical, creative, collaborative'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challenges = await Challenge.find({ type })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Challenge.countDocuments({ type });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalChallenges: total,
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

  static async searchChallenges(req, res) {
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
          { title: searchRegex },
          { description: searchRegex }
        ]
      };

      const challenges = await Challenge.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Challenge.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalChallenges: total,
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

module.exports = ChallengeController;
