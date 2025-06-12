import express from "express"
import mongoose from "mongoose"
import { authenticateToken } from "../middleware/auth.js"
import User from "../models/User.js" 

const router = express.Router()

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
})

const Message = mongoose.model("Message", messageSchema)

router.get("/:roomId", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { page = 1, limit = 50 } = req.query

    const messages = await Message.find({ roomId })
      .populate("senderId", "firstName lastName avatar")
      .populate("receiverId", "firstName lastName avatar")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    res.json({ messages: messages.reverse() })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { roomId, receiverId, message } = req.body
    const senderId = req.user.userId

    const newMessage = new Message({
      roomId,
      senderId,
      receiverId,
      message,
    })

    await newMessage.save()
    await newMessage.populate("senderId", "firstName lastName avatar")
    await newMessage.populate("receiverId", "firstName lastName avatar")

    res.status(201).json({ message: newMessage })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/rooms/list", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const currentUser = await User.findById(userId).populate("connections", "firstName lastName avatar role")

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const connections = currentUser.connections || []

    const rooms = await Promise.all(
      connections.map(async (connection) => {
        const roomId = [userId, connection._id.toString()].sort().join("-")

        const lastMessage = await Message.findOne({ roomId }).sort({ timestamp: -1 })

        const unreadCount = await Message.countDocuments({
          roomId,
          receiverId: userId,
          isRead: false,
        })

        return {
          _id: roomId,
          otherUser: connection, 
          lastMessage: lastMessage,
          unreadCount: unreadCount,
        }
      }),
    )

    // Filter out rooms with no messages if desired, or sort them
    const sortedRooms = rooms.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0
      const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0
      return timeB - timeA // Sort by most recent message
    })

    res.json({ rooms: sortedRooms })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Mark messages as read
router.put("/:roomId/read", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.userId

    await Message.updateMany({ roomId, receiverId: userId, isRead: false }, { isRead: true })

    res.json({ message: "Messages marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router

