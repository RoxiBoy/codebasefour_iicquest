const BehaviorVector = require('../models/BehaviorVector'); // Adjust path as needed
const User = require('../models/User'); // For validation

class BehaviorVectorController {
  static async createOrUpdateBehaviorVector(req, res) {
    try {
      const { user_id, cognitive_style, learning_mode, communication, motivation, dominant_trait } = req.body;

      if (!user_id || !cognitive_style || !learning_mode || !communication || !motivation || !dominant_trait) {
        return res.status(400).json({
          success: false,
          message: 'All behavior vector fields are required'
        });
      }

      const validations = [
        { field: 'cognitive_style', value: cognitive_style, valid: ['analytical', 'holistic'] },
        { field: 'learning_mode', value: learning_mode, valid: ['active', 'reflective'] },
        { field: 'communication', value: communication, valid: ['direct', 'nuanced'] },
        { field: 'motivation', value: motivation, valid: ['intrinsic', 'extrinsic'] },
        { field: 'dominant_trait', value: dominant_trait, valid: ['leader', 'collaborator', 'independent'] }
      ];

      for (const validation of validations) {
        if (!validation.valid.includes(validation.value)) {
          return res.status(400).json({
            success: false,
            message: `${validation.field} must be one of: ${validation.valid.join(', ')}`
          });
        }
      }

      const userExists = await User.findOne({ id: user_id });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let behaviorVector = await BehaviorVector.findOne({ user_id });

      if (behaviorVector) {
        behaviorVector.cognitive_style = cognitive_style;
        behaviorVector.learning_mode = learning_mode;
        behaviorVector.communication = communication;
        behaviorVector.motivation = motivation;
        behaviorVector.dominant_trait = dominant_trait;
        
        await behaviorVector.save();

        res.status(200).json({
          success: true,
          message: 'Behavior vector updated successfully',
          data: behaviorVector
        });
      } else {
        const newBehaviorVector = new BehaviorVector({
          user_id,
          cognitive_style,
          learning_mode,
          communication,
          motivation,
          dominant_trait
        });

        const savedBehaviorVector = await newBehaviorVector.save();

        res.status(201).json({
          success: true,
          message: 'Behavior vector created successfully',
          data: savedBehaviorVector
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getBehaviorVectorByUserId(req, res) {
    try {
      const { user_id } = req.params;

      const behaviorVector = await BehaviorVector.findOne({ user_id }).populate('user_id', 'name email role');

      if (!behaviorVector) {
        return res.status(404).json({
          success: false,
          message: 'Behavior vector not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        data: behaviorVector
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllBehaviorVectors(req, res) {
    try {
      const { 
        cognitive_style, 
        learning_mode, 
        communication, 
        motivation, 
        dominant_trait,
        page = 1, 
        limit = 10 
      } = req.query;

      const filter = {};
      if (cognitive_style) filter.cognitive_style = cognitive_style;
      if (learning_mode) filter.learning_mode = learning_mode;
      if (communication) filter.communication = communication;
      if (motivation) filter.motivation = motivation;
      if (dominant_trait) filter.dominant_trait = dominant_trait;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const behaviorVectors = await BehaviorVector.find(filter)
        .populate('user_id', 'name email role')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ _id: -1 });

      const total = await BehaviorVector.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: behaviorVectors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVectors: total,
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

  static async deleteBehaviorVector(req, res) {
    try {
      const { user_id } = req.params;

      const behaviorVector = await BehaviorVector.findOneAndDelete({ user_id });

      if (!behaviorVector) {
        return res.status(404).json({
          success: false,
          message: 'Behavior vector not found for this user'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Behavior vector deleted successfully',
        data: behaviorVector
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async findSimilarBehaviorPatterns(req, res) {
    try {
      const { user_id } = req.params;
      const { limit = 5 } = req.query;

      const targetBehavior = await BehaviorVector.findOne({ user_id });

      if (!targetBehavior) {
        return res.status(404).json({
          success: false,
          message: 'Behavior vector not found for this user'
        });
      }

      const allBehaviors = await BehaviorVector.find({ user_id: { $ne: user_id } })
        .populate('user_id', 'name email role');

      const similarUsers = allBehaviors.map(behavior => {
        let similarityScore = 0;
        let matchingTraits = [];

        if (behavior.cognitive_style === targetBehavior.cognitive_style) {
          similarityScore += 20;
          matchingTraits.push('cognitive_style');
        }
        if (behavior.learning_mode === targetBehavior.learning_mode) {
          similarityScore += 20;
          matchingTraits.push('learning_mode');
        }
        if (behavior.communication === targetBehavior.communication) {
          similarityScore += 20;
          matchingTraits.push('communication');
        }
        if (behavior.motivation === targetBehavior.motivation) {
          similarityScore += 20;
          matchingTraits.push('motivation');
        }
        if (behavior.dominant_trait === targetBehavior.dominant_trait) {
          similarityScore += 20;
          matchingTraits.push('dominant_trait');
        }

        return {
          user: behavior.user_id,
          behavior_profile: {
            cognitive_style: behavior.cognitive_style,
            learning_mode: behavior.learning_mode,
            communication: behavior.communication,
            motivation: behavior.motivation,
            dominant_trait: behavior.dominant_trait
          },
          similarity_score: similarityScore,
          matching_traits: matchingTraits
        };
      })
      .filter(user => user.similarity_score > 0) // Only include users with at least one match
      .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by similarity score
      .slice(0, parseInt(limit)); // Limit results

      res.status(200).json({
        success: true,
        data: {
          target_user_id: user_id,
          target_behavior: {
            cognitive_style: targetBehavior.cognitive_style,
            learning_mode: targetBehavior.learning_mode,
            communication: targetBehavior.communication,
            motivation: targetBehavior.motivation,
            dominant_trait: targetBehavior.dominant_trait
          },
          similar_users: similarUsers
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

  static async getBehaviorAnalytics(req, res) {
    try {
      const analytics = await BehaviorVector.aggregate([
        {
          $group: {
            _id: null,
            total_profiles: { $sum: 1 },
            cognitive_style_distribution: {
              $push: {
                $cond: [
                  { $eq: ['$cognitive_style', 'analytical'] },
                  'analytical',
                  'holistic'
                ]
              }
            },
            learning_mode_distribution: {
              $push: {
                $cond: [
                  { $eq: ['$learning_mode', 'active'] },
                  'active',
                  'reflective'
                ]
              }
            },
            communication_distribution: {
              $push: {
                $cond: [
                  { $eq: ['$communication', 'direct'] },
                  'direct',
                  'nuanced'
                ]
              }
            },
            motivation_distribution: {
              $push: {
                $cond: [
                  { $eq: ['$motivation', 'intrinsic'] },
                  'intrinsic',
                  'extrinsic'
                ]
              }
            },
            dominant_trait_distribution: {
              $push: '$dominant_trait'
            }
          }
        }
      ]);

      if (!analytics.length) {
        return res.status(200).json({
          success: true,
          data: {
            total_profiles: 0,
            distributions: {}
          }
        });
      }

      const data = analytics[0];
      const processDistribution = (array) => {
        const counts = {};
        array.forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });
        return counts;
      };

      res.status(200).json({
        success: true,
        data: {
          total_profiles: data.total_profiles,
          distributions: {
            cognitive_style: processDistribution(data.cognitive_style_distribution),
            learning_mode: processDistribution(data.learning_mode_distribution),
            communication: processDistribution(data.communication_distribution),
            motivation: processDistribution(data.motivation_distribution),
            dominant_trait: processDistribution(data.dominant_trait_distribution)
          }
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

  static async getCompatibilityScore(req, res) {
    try {
      const { user_id_1, user_id_2 } = req.params;

      const behavior1 = await BehaviorVector.findOne({ user_id: user_id_1 });
      const behavior2 = await BehaviorVector.findOne({ user_id: user_id_2 });

      if (!behavior1 || !behavior2) {
        return res.status(404).json({
          success: false,
          message: 'Behavior vector not found for one or both users'
        });
      }

      let compatibilityScore = 0;
      let matchingTraits = [];

      const traits = [
        'cognitive_style',
        'learning_mode', 
        'communication',
        'motivation',
        'dominant_trait'
      ];

      traits.forEach(trait => {
        if (behavior1[trait] === behavior2[trait]) {
          compatibilityScore += 20;
          matchingTraits.push(trait);
        }
      });

      res.status(200).json({
        success: true,
        data: {
          user_1: user_id_1,
          user_2: user_id_2,
          compatibility_score: compatibilityScore,
          compatibility_percentage: `${compatibilityScore}%`,
          matching_traits: matchingTraits,
          behavior_profiles: {
            user_1: behavior1,
            user_2: behavior2
          }
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

module.exports = BehaviorVectorController;
