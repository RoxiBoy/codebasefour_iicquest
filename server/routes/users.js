import express from "express"
import User from "../models/User.js"
import ConnectionRequest from "../models/ConnectionRequest.js"
import { authenticateToken } from "../middleware/auth.js"
import Opportunity from "../models/Opportunity.js"
import Assessment from "../models/Assessment.js"

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

    // Handle skills update separately to ensure proper validation
    if (updates.skills) {
      // Validate skills array
      const validatedSkills = updates.skills.map((skill) => ({
        name: skill.name,
        level: Math.min(Math.max(skill.level, 0), 100), // Ensure level is between 0-100
        category: skill.category,
        lastUpdated: new Date(),
        dateAdded: skill.dateAdded || new Date(),
      }))
      updates.skills = validatedSkills
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password")

    // Add activity log for profile update
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action: "profile_updated",
          timestamp: new Date(),
          metadata: {
            fieldsUpdated: Object.keys(updates),
            skillsCount: updates.skills ? updates.skills.length : 0,
          },
        },
      },
    })

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add a new skill to user profile
router.post("/skills", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { name, level, category } = req.body

    // Validate input
    if (!name || !category || level === undefined) {
      return res.status(400).json({ message: "Name, level, and category are required" })
    }

    if (level < 0 || level > 100) {
      return res.status(400).json({ message: "Level must be between 0 and 100" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if skill already exists
    const existingSkill = user.skills.find((skill) => skill.name.toLowerCase() === name.toLowerCase())

    if (existingSkill) {
      return res.status(400).json({ message: "Skill already exists. Use update endpoint to modify it." })
    }

    // Add new skill
    const newSkill = {
      name: name.trim(),
      level: Number.parseInt(level),
      category: category.trim(),
      dateAdded: new Date(),
      lastUpdated: new Date(),
    }

    user.skills.push(newSkill)
    await user.save()

    // Add activity log
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action: "skill_added",
          timestamp: new Date(),
          metadata: { skillName: name, skillLevel: level, skillCategory: category },
        },
      },
    })

    res.json({
      message: "Skill added successfully",
      skill: newSkill,
      totalSkills: user.skills.length,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update an existing skill
router.put("/skills/:skillId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { skillId } = req.params
    const { name, level, category } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const skill = user.skills.id(skillId)
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }

    // Update skill fields
    if (name !== undefined) skill.name = name.trim()
    if (level !== undefined) {
      if (level < 0 || level > 100) {
        return res.status(400).json({ message: "Level must be between 0 and 100" })
      }
      skill.level = Number.parseInt(level)
    }
    if (category !== undefined) skill.category = category.trim()
    skill.lastUpdated = new Date()

    await user.save()

    // Add activity log
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action: "skill_updated",
          timestamp: new Date(),
          metadata: { skillName: skill.name, skillLevel: skill.level },
        },
      },
    })

    res.json({ message: "Skill updated successfully", skill })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete a skill
router.delete("/skills/:skillId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { skillId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const skill = user.skills.id(skillId)
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }

    const skillName = skill.name
    skill.deleteOne()
    await user.save()

    // Add activity log
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action: "skill_removed",
          timestamp: new Date(),
          metadata: { skillName },
        },
      },
    })

    res.json({ message: "Skill deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user's skills
router.get("/skills", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("skills")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ skills: user.skills })
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
      query.$or = [
        { "skillDNA.skillName": { $in: skillArray } },
        { "skills.name": { $in: skillArray } },
        { expertise: { $in: skillArray } },
      ]
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
        { "skills.name": { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(query)
      .select("firstName lastName avatar bio skillDNA behavioralProfile experience expertise skills location verified")
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
      "firstName lastName avatar role bio expertise skillDNA skills",
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
      // Count skills mastered (both from skillDNA and user-added skills)
      const skillDNAMastered = user.skillDNA.filter((skill) => skill.level >= 90).length
      const userSkillsMastered = user.skills.filter((skill) => skill.level >= 90).length
      stats.skillsMastered = skillDNAMastered + userSkillsMastered
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get historical stats for percentage calculations
router.get("/stats/historical", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)

    // Calculate stats from 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // For connections, we can check activity log for historical data
    const connectionActivities = user.activityLog.filter(
      (activity) => activity.action === "connection_accepted" && activity.timestamp < thirtyDaysAgo,
    )

    const historicalStats = {
      connections: connectionActivities.length,
      period: "last month",
    }

    // For other stats, you might want to implement a more sophisticated tracking system
    // For now, we'll provide some mock historical data
    if (user.role === "mentor") {
      historicalStats.opportunitiesPosted = Math.max(0, (await Opportunity.countDocuments({ createdBy: userId })) - 2)
      historicalStats.applicationsReceived = Math.max(0, historicalStats.opportunitiesPosted * 3)
    } else {
      historicalStats.skillsMastered = Math.max(0, user.skills.filter((skill) => skill.level >= 90).length - 1)
      historicalStats.assessmentsCompleted = Math.max(
        0,
        (await Assessment.countDocuments({ userId, status: "completed" })) - 1,
      )
    }

    res.json(historicalStats)
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

    // Add recent skill additions from activity log
    const recentSkillActivities = user.activityLog
      .filter((activity) => ["skill_added", "skill_updated", "profile_updated"].includes(activity.action))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)

    recentSkillActivities.forEach((activity) => {
      let description = ""
      switch (activity.action) {
        case "skill_added":
          description = `Added ${activity.metadata.skillName} skill.`
          break
        case "skill_updated":
          description = `Updated ${activity.metadata.skillName} skill.`
          break
        case "profile_updated":
          description = "Updated profile information."
          break
      }
      activities.push({
        type: "skill",
        description,
        timestamp: new Date(activity.timestamp).toLocaleDateString(),
      })
    })

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    res.json({ activities: activities.slice(0, 10) }) // Return top 10 activities
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get current achievements for dashboard
router.get("/achievements/current", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)

    // Mock achievement system - you can expand this based on your requirements
    let currentAchievement = null

    const skillsCount = user.skills.length
    const connectionsCount = user.connections.length

    if (skillsCount >= 5 && skillsCount < 10) {
      currentAchievement = {
        title: "Skill Builder",
        description: "Add 10 skills to unlock the next achievement",
        progress: (skillsCount / 10) * 100,
        remainingCount: 10 - skillsCount,
        nextAchievement: "Skill Master",
        gradient: "bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-400",
        isNew: skillsCount === 5,
      }
    } else if (connectionsCount >= 3 && connectionsCount < 10) {
      currentAchievement = {
        title: "Network Builder",
        description: "Connect with 10 people to unlock the next achievement",
        progress: (connectionsCount / 10) * 100,
        remainingCount: 10 - connectionsCount,
        nextAchievement: "Super Connector",
        gradient: "bg-gradient-to-br from-green-400 via-teal-400 to-blue-400",
        isNew: connectionsCount === 3,
      }
    }

    res.json({ currentAchievement })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
