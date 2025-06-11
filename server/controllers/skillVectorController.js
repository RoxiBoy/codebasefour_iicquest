const SkillVector = require('../models/SkillVector'); // Adjust path as needed
const User = require('../models/User'); // Adjust path as needed

class SkillVectorController {
  static async createSkillVector(req, res) {
    try {
      const { user_id, logical_reasoning, creativity, communication, collaboration } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
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

      // Check if skill vector already exists for this user
      const existingSkillVector = await SkillVector.findOne({ user_id });
      if (existingSkillVector) {
        return res.status(409).json({
          success: false,
          message: 'Skill vector for this user already exists'
        });
      }

      const newSkillVector = new SkillVector({
        user_id,
        logical_reasoning: logical_reasoning || 0,
        creativity: creativity || 0,
        communication: communication || 0,
        collaboration: collaboration || 0,
        updated_at: new Date()
      });

      const savedSkillVector = await newSkillVector.save();

      res.status(201).json({
        success: true,
        message: 'Skill vector created successfully',
        data: savedSkillVector
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllSkillVectors(req, res) {
    try {
      const { user_id, page = 1, limit = 10 } = req.query;

      const filter = {};
      if (user_id) filter.user_id = user_id;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const skillVectors = await SkillVector.find(filter)
        .populate('user_id', 'name email role')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ updated_at: -1 });

      const total = await SkillVector.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: skillVectors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSkillVectors: total,
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

  static async getSkillVectorByUserId(req, res) {
    try {
      const { user_id } = req.params;

      const skillVector = await SkillVector.findOne({ user_id })
        .populate('user_id', 'name email role');

      if (!skillVector) {
        return res.status(404).json({
          success: false,
          message: 'Skill vector not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        data: skillVector
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateSkillVector(req, res) {
    try {
      const { user_id } = req.params;
      const updates = req.body;

      delete updates.user_id; // Prevent changing user_id
      delete updates._id;

      // Validate numeric fields if provided
      if (updates.logical_reasoning && updates.logical_reasoning < 0) {
        return res.status(400).json({
          success: false,
          message: 'Logical reasoning score cannot be negative'
        });
      }
      if (updates.creativity && updates.creativity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Creativity score cannot be negative'
        });
      }
      if (updates.communication && updates.communication < 0) {
        return res.status(400).json({
          success: false,
          message: 'Communication score cannot be negative'
        });
      }
      if (updates.collaboration && updates.collaboration < 0) {
        return res.status(400).json({
          success: false,
          message: 'Collaboration score cannot be negative'
        });
      }

      updates.updated_at = new Date();

      const skillVector = await SkillVector.findOneAndUpdate(
        { user_id },
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('user_id', 'name email role');

      if (!skillVector) {
        return res.status(404).json({
          success: false,
          message: 'Skill vector not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Skill vector updated successfully',
        data: skillVector
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async deleteSkillVector(req, res) {
    try {
      const { user_id } = req.params;

      const skillVector = await SkillVector.findOneAndDelete({ user_id })
        .populate('user_id', 'name email role');

      if (!skillVector) {
        return res.status(404).json({
          success: false,
          message: 'Skill vector not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Skill vector deleted successfully',
        data: skillVector
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

module.exports = SkillVectorController;
