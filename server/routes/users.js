import express from "express"
import User from "../models/User.js"
import ConnectionRequest from "../models/ConnectionRequest.js"
import { authenticateToken } from "../middleware/auth.js"
import Opportunity from "../models/Opportunity.js"
import Assessment from "../models/Assessment.js" // Import Assessment model

const router = express.Router()

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("skillDNA.skillId")
      .populate("connections", "firstName lastName avatar role")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const updates = req.body

    // Remove sensitive fields
    delete updates.password
    delete updates.email
    delete updates.role

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password")

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get users for matching (mentors for learners, learners for mentors)
router.get("/discover", authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId)
    const { page = 1, limit = 10, skills, experience, search } = req.query

    const targetRole = currentUser.role === "learner" ? "mentor" : "learner"

    const query = {
      role: targetRole,
      _id: { $ne: req.user.userId },
      isProfilePublic: true,
    }

    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim())
      query["skillDNA.skillName"] = { $in: skillArray }
    }

    if (experience) {
      query.experience = { $gte: Number.parseInt(experience) }
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { expertise: { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(query)
      .select("firstName lastName avatar bio skillDNA behavioralProfile experience expertise")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    // Check connection status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (u) => {
        const isConnected = currentUser.connections.includes(u._id)
        let connectionStatus = null

        if (!isConnected) {
          const sentRequest = await ConnectionRequest.findOne({
            sender: req.user.userId,
            receiver: u._id,
            status: "pending",
          })
          const receivedRequest = await ConnectionRequest.findOne({
            sender: u._id,
            receiver: req.user.userId,
            status: "pending",
          })

          if (sentRequest) {
            connectionStatus = "pending_sent"
          } else if (receivedRequest) {
            connectionStatus = "pending_received"
          }
        } else {
          connectionStatus = "connected"
        }

        return { ...u.toObject(), isConnected, connectionStatus }
      }),
    )

    res.json({
      users: usersWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Send connection request
router.post("/connect/:userId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const targetUserId = req.params.userId

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "Cannot connect to yourself" })
    }

    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(targetUserId)

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({ message: "Already connected" })
    }

    // Check for existing pending request
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId, status: "pending" },
        { sender: targetUserId, receiver: currentUserId, status: "pending" },
      ],
    })

    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already pending" })
    }

    const newRequest = new ConnectionRequest({
      sender: currentUserId,
      receiver: targetUserId,
    })
    await newRequest.save()

    res.json({ message: "Connection request sent successfully", status: "pending" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user's connections
router.get("/connections", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "connections",
      "firstName lastName avatar role bio expertise skillDNA",
    )

    res.json({ connections: user.connections })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get received connection requests
router.get("/requests/received", authenticateToken, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ receiver: req.user.userId, status: "pending" }).populate(
      "sender",
      "firstName lastName avatar role bio",
    )
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Accept connection request
router.post("/requests/:requestId/accept", authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.requestId
    const currentUserId = req.user.userId

    const request = await ConnectionRequest.findOne({ _id: requestId, receiver: currentUserId, status: "pending" })

    if (!request) {
      return res.status(404).json({ message: "Connection request not found or already processed" })
    }

    request.status = "accepted"
    request.updatedAt = new Date()
    await request.save()

    // Establish mutual connection
    await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
    await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

    // Add activity log for both users
    await User.findByIdAndUpdate(request.sender, {
      $push: {
        activityLog: {
          action: "connection_accepted",
          timestamp: new Date(),
          metadata: { connectedUserId: request.receiver, type: "accepted_by_other" },
        },
      },
    })
    await User.findByIdAndUpdate(request.receiver, {
      $push: {
        activityLog: {
          action: "connection_accepted",
          timestamp: new Date(),
          metadata: { connectedUserId: request.sender, type: "accepted_by_self" },
        },
      },
    })

    res.json({ message: "Connection accepted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Reject connection request
router.post("/requests/:requestId/reject", authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.requestId
    const currentUserId = req.user.userId

    const request = await ConnectionRequest.findOne({ _id: requestId, receiver: currentUserId, status: "pending" })

    if (!request) {
      return res.status(404).json({ message: "Connection request not found or already processed" })
    }

    request.status = "rejected"
    request.updatedAt = new Date()
    await request.save()

    res.json({ message: "Connection request rejected" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update skill DNA after assessment
router.post("/update-skill-dna", authenticateToken, async (req, res) => {
  try {
    const { skillScores, behavioralProfile } = req.body
    const userId = req.user.userId

    const user = await User.findById(userId)

    // Update skill DNA
    for (const [skillName, score] of Object.entries(skillScores)) {
      const existingSkill = user.skillDNA.find((skill) => skill.skillName === skillName)

      if (existingSkill) {
        const previousScore = existingSkill.level
        existingSkill.level = score
        existingSkill.lastAssessed = new Date()
        existingSkill.growthRate = score - previousScore // Calculate growth rate
        existingSkill.assessmentHistory.push({
          score,
          date: new Date(),
          assessmentType: "comprehensive",
        })
      } else {
        user.skillDNA.push({
          skillName,
          level: score,
          lastAssessed: new Date(),
          growthRate: 0, // Initial growth rate is 0 for new skills
          assessmentHistory: [
            {
              score,
              date: new Date(),
              assessmentType: "comprehensive",
            },
          ],
        })
      }
    }

    // Update behavioral profile
    if (behavioralProfile) {
      user.behavioralProfile = {
        ...user.behavioralProfile,
        ...behavioralProfile,
        lastAssessed: new Date(),
      }
    }

    await user.save()

    res.json({ message: "Skill DNA updated successfully", skillDNA: user.skillDNA })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get specific user profile (for viewing others' profiles)
router.get("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.userId

    const user = await User.findById(userId).select("-password").populate("skillDNA.skillId")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Determine connection status
    const currentUser = await User.findById(currentUserId)
    const isConnected = currentUser.connections.includes(userId)
    let connectionStatus = null

    if (isConnected) {
      connectionStatus = "connected"
    } else {
      const sentRequest = await ConnectionRequest.findOne({
        sender: currentUserId,
        receiver: userId,
        status: "pending",
      })
      const receivedRequest = await ConnectionRequest.findOne({
        sender: userId,
        receiver: currentUserId,
        status: "pending",
      })

      if (sentRequest) {
        connectionStatus = "pending_sent"
      } else if (receivedRequest) {
        connectionStatus = "pending_received"
      } else {
        connectionStatus = "not_connected"
      }
    }

    res.json({
      user: {
        ...user.toObject(),
        email: isConnected ? user.email : undefined, // Hide email if not connected
        phone: isConnected ? user.phone : undefined,
        website: isConnected ? user.website : undefined,
        learningGoals: isConnected ? user.learningGoals : undefined,
        workExperience: isConnected ? user.workExperience : undefined,
        education: isConnected ? user.education : undefined,
        achievements: isConnected ? user.achievements : undefined,
        certifications: isConnected ? user.certifications : undefined,
        behavioralProfile: isConnected ? user.behavioralProfile : undefined,
        preferredLearningStyle: isConnected ? user.preferredLearningStyle : undefined,
      },
      isConnected,
      connectionStatus,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user stats for dashboard
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)

    const stats = {
      connections: user.connections.length,
      growthScore: 0, // Will calculate below
    }

    // Calculate assessments completed by querying the Assessment model
    stats.assessmentsCompleted = await Assessment.countDocuments({ userId: userId, status: "completed" })

    // Calculate growth score
    if (user.skillDNA && user.skillDNA.length > 0) {
      const totalGrowth = user.skillDNA.reduce((sum, skill) => sum + (skill.growthRate || 0), 0)
      stats.growthScore = Math.round(totalGrowth / user.skillDNA.length)
    }

    if (user.role === "mentor") {
      const opportunities = await Opportunity.find({ createdBy: userId })
      stats.opportunitiesPosted = opportunities.length
      stats.applicationsReceived = opportunities.reduce((sum, opp) => sum + opp.applications.length, 0)
    } else {
      stats.skillsMastered = user.skillDNA.filter((skill) => skill.level >= 90).length
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get recent activity for dashboard
router.get("/activity", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)

    const activities = []

    // Fetch recent completed assessments
    const recentAssessments = await Assessment.find({ userId: userId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(3)
    recentAssessments.forEach((assessment) => {
      activities.push({
        type: "assessment",
        description: `Completed ${assessment.type} assessment.`,
        timestamp: new Date(assessment.createdAt).toLocaleDateString(),
      })
    })

    // Fetch recent accepted connection requests where current user is sender or receiver
    const recentAcceptedConnections = await ConnectionRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(3)

    recentAcceptedConnections.forEach((request) => {
      const otherUser = request.sender._id.toString() === userId ? request.receiver : request.sender
      activities.push({
        type: "connection",
        description: `Connected with ${otherUser.firstName} ${otherUser.lastName}.`,
        timestamp: new Date(request.updatedAt).toLocaleDateString(),
      })
    })

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    res.json({ activities })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router

