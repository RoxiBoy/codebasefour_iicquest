const Challenge = require('../models/Challenge');
const { v4: uuidv4 } = require('uuid');

class ChallengeController {
  static async createChallenge(req, res) {
    try {
      const {
        title,
        description,
        type,
        expected_time,
        evaluator,
        score_weights
      } = req.body;

      if (!title || !type || !expected_time || !evaluator || !score_weights) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, type, expected_time, evaluator, score_weights'
        });
      }

      if (!['logical', 'creative', 'collaborative'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge type. Must be: logical, creative, or collaborative'
        });
      }

      if (!['auto', 'manual'].includes(evaluator)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid evaluator type. Must be: auto or manual'
        });
      }

      const { accuracy, speed, confidence } = score_weights;
      if (typeof accuracy !== 'number' || typeof speed !== 'number' || typeof confidence !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'score_weights must contain numeric values for accuracy, speed, and confidence'
        });
      }

      const totalWeight = accuracy + speed + confidence;
      if (Math.abs(totalWeight - 1) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Score weights must sum to 1.0 (100%)'
        });
      }

      const newChallenge = new Challenge({
        id: uuidv4(),
        title,
        description: description || '',
        type,
        expected_time,
        evaluator,
        score_weights: {
          accuracy,
          speed,
          confidence
        }
      });

      const savedChallenge = await newChallenge.save();

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        data: savedChallenge
      });

    } catch (error) {
      console.error('Error creating challenge:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Challenge with this ID already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getAllChallenges(req, res) {
    try {
      const {
        type,
        evaluator,
        limit = 10,
        page = 1,
        sort_by = 'title',
        sort_order = 'asc'
      } = req.query;

      const filter = {};
      if (type && ['logical', 'creative', 'collaborative'].includes(type)) {
        filter.type = type;
      }
      if (evaluator && ['auto', 'manual'].includes(evaluator)) {
        filter.evaluator = evaluator;
      }

      const sortOrder = sort_order === 'desc' ? -1 : 1;
      const sortObj = { [sort_by]: sortOrder };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const challenges = await Challenge
        .find(filter)
        .sort(sortObj)
        .limit(parseInt(limit))
        .skip(skip)
        .select('-__v'); // Exclude version field

      const totalChallenges = await Challenge.countDocuments(filter);
      const totalPages = Math.ceil(totalChallenges / parseInt(limit));

      res.status(200).json({
        success: true,
        data: challenges,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_challenges: totalChallenges,
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        }
      });

    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getChallengeById(req, res) {
    try {
      const { id } = req.params;

      const challenge = await Challenge.findOne({ id }).select('-__v');

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
      console.error('Error fetching challenge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async updateChallenge(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      delete updateData.id;

      if (updateData.type && !['logical', 'creative', 'collaborative'].includes(updateData.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge type. Must be: logical, creative, or collaborative'
        });
      }

      if (updateData.evaluator && !['auto', 'manual'].includes(updateData.evaluator)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid evaluator type. Must be: auto or manual'
        });
      }

      if (updateData.score_weights) {
        const { accuracy, speed, confidence } = updateData.score_weights;
        if (typeof accuracy !== 'number' || typeof speed !== 'number' || typeof confidence !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'score_weights must contain numeric values for accuracy, speed, and confidence'
          });
        }

        const totalWeight = accuracy + speed + confidence;
        if (Math.abs(totalWeight - 1) > 0.01) {
          return res.status(400).json({
            success: false,
            message: 'Score weights must sum to 1.0 (100%)'
          });
        }
      }

      const updatedChallenge = await Challenge.findOneAndUpdate(
        { id },
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-__v'
        }
      );

      if (!updatedChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge updated successfully',
        data: updatedChallenge
      });

    } catch (error) {
      console.error('Error updating challenge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteChallenge(req, res) {
    try {
      const { id } = req.params;

      const deletedChallenge = await Challenge.findOneAndDelete({ id });

      if (!deletedChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully',
        data: {
          id: deletedChallenge.id,
          title: deletedChallenge.title
        }
      });

    } catch (error) {
      console.error('Error deleting challenge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getChallengesByType(req, res) {
    try {
      const { type } = req.params;
      const { limit = 5, random = false } = req.query;

      if (!['logical', 'creative', 'collaborative'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge type. Must be: logical, creative, or collaborative'
        });
      }

      let challenges;
      
      if (random === 'true') {
        challenges = await Challenge.aggregate([
          { $match: { type } },
          { $sample: { size: parseInt(limit) } },
          { $project: { __v: 0 } }
        ]);
      } else {
        challenges = await Challenge
          .find({ type })
          .limit(parseInt(limit))
          .select('-__v');
      }

      res.status(200).json({
        success: true,
        data: challenges,
        meta: {
          type,
          count: challenges.length,
          random: random === 'true'
        }
      });

    } catch (error) {
      console.error('Error fetching challenges by type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getChallengeStats(req, res) {
    try {
      const stats = await Challenge.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avg_expected_time: { $avg: '$expected_time' },
            auto_evaluator_count: {
              $sum: { $cond: [{ $eq: ['$evaluator', 'auto'] }, 1, 0] }
            },
            manual_evaluator_count: {
              $sum: { $cond: [{ $eq: ['$evaluator', 'manual'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const totalChallenges = await Challenge.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          total_challenges: totalChallenges,
          by_type: stats,
          summary: {
            logical: stats.find(s => s._id === 'logical')?.count || 0,
            creative: stats.find(s => s._id === 'creative')?.count || 0,
            collaborative: stats.find(s => s._id === 'collaborative')?.count || 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching challenge stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async bulkCreateChallenges(req, res) {
    try {
      const { challenges } = req.body;

      if (!Array.isArray(challenges) || challenges.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Challenges array is required and must not be empty'
        });
      }

      const challengesWithIds = challenges.map(challenge => ({
        ...challenge,
        id: challenge.id || uuidv4(),
        description: challenge.description || ''
      }));

      const createdChallenges = await Challenge.insertMany(challengesWithIds, {
        ordered: false // Continue on error
      });

      res.status(201).json({
        success: true,
        message: `Successfully created ${createdChallenges.length} challenges`,
        data: {
          created_count: createdChallenges.length,
          challenges: createdChallenges.map(c => ({ id: c.id, title: c.title }))
        }
      });

    } catch (error) {
      console.error('Error bulk creating challenges:', error);
      
      if (error.writeErrors) {
        return res.status(207).json({
          success: true,
          message: 'Partial success - some challenges created',
          data: {
            created_count: error.result.nInserted,
            errors: error.writeErrors.map(e => ({
              index: e.index,
              message: e.errmsg
            }))
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ChallengeController;
