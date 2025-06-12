import express from "express"
import Opportunity from "../models/Opportunity.js"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get opportunities (with filtering and matching)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { type, location, experience, skills, search, myOpportunities, page = 1, limit = 10 } = req.query
    const userId = req.user.userId

    const query = { status: "active" }

    if (myOpportunities === "true") {
      query.createdBy = userId
    }

    if (type) query.type = type
    if (location) query.location = { $regex: location, $options: "i" }
    if (experience) query.experienceLevel = experience
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }
    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim())
      query["requiredSkills.skillName"] = { $in: skillArray }
    }

    const opportunities = await Opportunity.find(query)
      .populate("createdBy", "firstName lastName avatar")
      .populate("requiredSkills.skillId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Calculate match scores for learners
    const user = await User.findById(userId)
    if (user.role === "learner") {
      for (const opportunity of opportunities) {
        opportunity.matchScore = calculateMatchScore(user.skillDNA, opportunity.requiredSkills)
      }
    }

    const total = await Opportunity.countDocuments(query)

    res.json({
      opportunities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get mentor's opportunities (specific endpoint for dashboard)
router.get("/my-opportunities", authenticateToken, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user.userId })
      .populate("createdBy", "firstName lastName avatar")
      .sort({ createdAt: -1 })

    // Add application counts
    const opportunitiesWithCounts = opportunities.map((opp) => ({
      ...opp.toObject(),
      applicationCount: opp.applications.length,
      pendingCount: opp.applications.filter((app) => app.status === "pending").length,
    }))

    res.json({ opportunities: opportunitiesWithCounts })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create new opportunity (mentors only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can create opportunities" })
    }

    const opportunity = new Opportunity({
      ...req.body,
      createdBy: req.user.userId,
    })

    await opportunity.save()
    await opportunity.populate("createdBy", "firstName lastName avatar")

    res.status(201).json({ opportunity })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Apply to opportunity
router.post("/:id/apply", authenticateToken, async (req, res) => {
  try {
    const { coverLetter } = req.body
    const opportunityId = req.params.id
    const userId = req.user.userId

    const opportunity = await Opportunity.findById(opportunityId)
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    // Check if already applied
    const existingApplication = opportunity.applications.find((app) => app.userId.toString() === userId)

    if (existingApplication) {
      return res.status(400).json({ message: "Already applied to this opportunity" })
    }

    // Calculate match score
    const user = await User.findById(userId)
    const matchScore = calculateMatchScore(user.skillDNA, opportunity.requiredSkills)

    opportunity.applications.push({
      userId,
      coverLetter,
      matchScore,
      appliedAt: new Date(),
      status: "pending",
    })

    await opportunity.save()

    res.json({ message: "Application submitted successfully", matchScore })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get applications for an opportunity (mentor only)
router.get("/:id/applications", authenticateToken, async (req, res) => {
  try {
    const opportunityId = req.params.id

    const opportunity = await Opportunity.findById(opportunityId)
      .populate("applications.userId", "firstName lastName avatar skillDNA behavioralProfile")
      .populate("createdBy", "firstName lastName")

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    // Check if user is the creator
    if (opportunity.createdBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      opportunity: {
        _id: opportunity._id,
        title: opportunity.title,
        description: opportunity.description,
        type: opportunity.type,
        experienceLevel: opportunity.experienceLevel,
      },
      applications: opportunity.applications,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single opportunity (for editing)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("createdBy", "firstName lastName avatar")
      .populate("requiredSkills.skillId")

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    res.json({ opportunity })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update opportunity
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    // Check if user owns this opportunity
    if (opportunity.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "firstName lastName avatar")

    res.json({ opportunity: updatedOpportunity })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update application status
router.put("/:id/applications/:applicationId", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const { id, applicationId } = req.params

    const opportunity = await Opportunity.findById(id)

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    // Check if user owns this opportunity
    if (opportunity.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Find and update the application
    const application = opportunity.applications.id(applicationId)
    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    application.status = status
    await opportunity.save()

    res.json({ message: "Application status updated", application })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper function to calculate match score
function calculateMatchScore(userSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 0

  let totalScore = 0
  let totalWeight = 0

  for (const required of requiredSkills) {
    const userSkill = userSkills?.find((skill) => skill.skillName === required.skillName)
    const weight = required.weight || 1

    if (userSkill) {
      const skillMatch = Math.min(userSkill.level / required.minimumLevel, 1)
      totalScore += skillMatch * weight
    }
    totalWeight += weight
  }

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0
}

export default router

