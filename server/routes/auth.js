import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const user = new User({
      email,
      password,
      role,
      firstName,
      lastName,
    })

    await user.save()

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
