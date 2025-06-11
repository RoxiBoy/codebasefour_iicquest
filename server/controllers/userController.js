const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserController {
  static async signup(req, res) {
    try {
      const { name, email, password, role, auth_provider, profile } = req.body;

      if (!name || !email || !role || !auth_provider) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, role, and auth_provider are required'
        });
      }

      if (!['learner', 'mentor', 'provider'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be one of: learner, mentor, provider'
        });
      }

      if (!['google', 'email'].includes(auth_provider)) {
        return res.status(400).json({
          success: false,
          message: 'Auth provider must be one of: google, email'
        });
      }

      if (auth_provider === 'email' && !password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required for email authentication'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const newUser = new User({
        id: uuidv4(),
        name,
        email,
        password: auth_provider === 'email' ? password : undefined,
        role,
        auth_provider,
        profile: profile || {}
      });

      const savedUser = await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser.id, email: savedUser.email, role: savedUser.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: savedUser,
          token
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or ID already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const user = await User.findOne({ email, auth_provider: 'email' });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or user not registered with email provider'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
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

  static async createUser(req, res) {
    // Same as signup but without token generation for backward compatibility
    try {
      const { name, email, password, role, auth_provider, profile } = req.body;

      if (!name || !email || !role || !auth_provider) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, role, and auth_provider are required'
        });
      }

      if (!['learner', 'mentor', 'provider'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be one of: learner, mentor, provider'
        });
      }

      if (!['google', 'email'].includes(auth_provider)) {
        return res.status(400).json({
          success: false,
          message: 'Auth provider must be one of: google, email'
        });
      }

      if (auth_provider === 'email' && !password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required for email authentication'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const newUser = new User({
        id: uuidv4(),
        name,
        email,
        password: auth_provider === 'email' ? password : undefined,
        role,
        auth_provider,
        profile: profile || {}
      });

      const savedUser = await newUser.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: savedUser
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or ID already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { role, auth_provider, page = 1, limit = 10 } = req.query;
      
      const filter = {};
      if (role) filter.role = role;
      if (auth_provider) filter.auth_provider = auth_provider;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const users = await User.find(filter)
        .select('-password') // Exclude password from response
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ created_at: -1 });

      const total = await User.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
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

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findOne({ id }).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      
      const user = await User.findOne({ email }).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates.id;
      delete updates.created_at;
      delete updates._id;

      if (updates.role && !['learner', 'mentor', 'provider'].includes(updates.role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be one of: learner, mentor, provider'
        });
      }

      if (updates.auth_provider && !['google', 'email'].includes(updates.auth_provider)) {
        return res.status(400).json({
          success: false,
          message: 'Auth provider must be one of: google, email'
        });
      }

      if (updates.password && updates.auth_provider === 'email') {
        updates.password = await bcrypt.hash(updates.password, 10);
      } else {
        delete updates.password;
      }

      const user = await User.findOneAndUpdate(
        { id },
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const { bio, education, interests, preferred_industries } = req.body;

      const profileUpdate = {};
      if (bio !== undefined) profileUpdate['profile.bio'] = bio;
      if (education !== undefined) profileUpdate['profile.education'] = education;
      if (interests !== undefined) profileUpdate['profile.interests'] = interests;
      if (preferred_industries !== undefined) profileUpdate['profile.preferred_industries'] = preferred_industries;

      const user = await User.findOneAndUpdate(
        { id },
        { $set: profileUpdate },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findOneAndDelete({ id }).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['learner', 'mentor', 'provider'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: learner, mentor, provider'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const users = await User.find({ role })
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ created_at: -1 });

      const total = await User.countDocuments({ role });
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
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

  static async searchUsers(req, res) {
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
          { name: searchRegex },
          { email: searchRegex }
        ]
      };

      const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ created_at: -1 });

      const total = await User.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
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

module.exports = UserController
