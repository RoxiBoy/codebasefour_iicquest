import express from "express"
import Skill from "../models/Skill.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get all skills
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query
    const query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const skills = await Skill.find(query).sort({ name: 1 })
    res.json({ skills })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create new skill (admin only for now)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const skill = new Skill(req.body)
    await skill.save()
    res.status(201).json({ skill })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get skill categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Skill.distinct("category")
    res.json({ categories })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get trending skills
router.get("/trending", async (req, res) => {
  try {
    const trendingSkills = await Skill.find({ trendDirection: "rising" }).sort({ demandLevel: -1 }).limit(10)

    res.json({ skills: trendingSkills })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
