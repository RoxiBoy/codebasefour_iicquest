const Opportunity = require('../models/Opportunity'); // Adjust path as needed
const { v4: uuidv4 } = require('uuid');

class OpportunityController {
  static async createOpportunity(req, res) {
    try {
      const { title, description, required_skills, role_type, compatibility_scores } = req.body;

      if (!title || !role_type) {
        return res.status(400).json({
          success: false,
          message: 'Title and role_type are required'
        });
      }

      if (!['internship', 'project', 'job'].includes(role_type)) {
        return res.status(400).json({
          success: false,
          message: 'Role type must be one of: internship, project, job'
        });
      }

      const newOpportunity = new Opportunity({
        id: uuidv4(),
        title,
        description: description || '',
        required_skills: required_skills || [],
        role_type,
        compatibility_scores: compatibility_scores || new Map()
      });

      const savedOpportunity = await newOpportunity.save();

      res.status(201).json({
        success: true,
        message: 'Opportunity created successfully',
        data: savedOpportunity
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Opportunity with this ID already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllOpportunities(req, res) {
    try {
      const { role_type, skills, page = 1, limit = 10 } = req.query;
      
      const filter = {};
      if (role_type) filter.role_type = role_type;
      if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        filter.required_skills = { $in: skillsArray };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const opportunities = await Opportunity.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Opportunity.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: opportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOpportunities: total,
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

  static async getOpportunityById(req, res) {
    try {
      const { id } = req.params;
      
      const opportunity = await Opportunity.findOne({ id });
      
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      res.status(200).json({
        success: true,
        data: opportunity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateOpportunity(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates.id;
      delete updates._id;

      if (updates.role_type && !['internship', 'project', 'job'].includes(updates.role_type)) {
        return res.status(400).json({
          success: false,
          message: 'Role type must be one of: internship, project, job'
        });
      }

      const opportunity = await Opportunity.findOneAndUpdate(
        { id },
        updates,
        { new: true, runValidators: true }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Opportunity updated successfully',
        data: opportunity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async deleteOpportunity(req, res) {
    try {
      const { id } = req.params;
      
      const opportunity = await Opportunity.findOneAndDelete({ id });
      
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Opportunity deleted successfully',
        data: opportunity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getOpportunitiesByRoleType(req, res) {
    try {
      const { role_type } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['internship', 'project', 'job'].includes(role_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role type. Must be one of: internship, project, job'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const opportunities = await Opportunity.find({ role_type })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Opportunity.countDocuments({ role_type });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: opportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOpportunities: total,
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

  static async searchOpportunities(req, res) {
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

      const opportunities = await Opportunity.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Opportunity.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: opportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOpportunities: total,
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

  static async getOpportunitiesBySkills(req, res) {
    try {
      const { skills } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!skills) {
        return res.status(400).json({
          success: false,
          message: 'Skills parameter is required'
        });
      }

      const skillsArray = skills.split(',').map(skill => skill.trim());
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const opportunities = await Opportunity.find({
        required_skills: { $in: skillsArray }
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await Opportunity.countDocuments({
        required_skills: { $in: skillsArray }
      });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: opportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOpportunities: total,
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

  static async updateCompatibilityScore(req, res) {
    try {
      const { id } = req.params;
      const { user_id, score } = req.body;

      if (!user_id || score === undefined) {
        return res.status(400).json({
          success: false,
          message: 'user_id and score are required'
        });
      }

      if (score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          message: 'Score must be between 0 and 100'
        });
      }

      const opportunity = await Opportunity.findOneAndUpdate(
        { id },
        { $set: { [`compatibility_scores.${user_id}`]: score } },
        { new: true, runValidators: true }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Compatibility score updated successfully',
        data: opportunity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getCompatibilityScore(req, res) {
    try {
      const { id, user_id } = req.params;

      const opportunity = await Opportunity.findOne({ id });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      const score = opportunity.compatibility_scores.get(user_id);

      if (score === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Compatibility score not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          opportunity_id: id,
          user_id,
          compatibility_score: score
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

  static async getOpportunitiesRankedByCompatibility(req, res) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const opportunities = await Opportunity.find({
        [`compatibility_scores.${user_id}`]: { $exists: true }
      });

      const sortedOpportunities = opportunities
        .map(opp => ({
          ...opp.toObject(),
          user_compatibility_score: opp.compatibility_scores.get(user_id)
        }))
        .sort((a, b) => b.user_compatibility_score - a.user_compatibility_score);

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedOpportunities = sortedOpportunities.slice(skip, skip + parseInt(limit));

      const total = sortedOpportunities.length;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: paginatedOpportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOpportunities: total,
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

module.exports = OpportunityController;
