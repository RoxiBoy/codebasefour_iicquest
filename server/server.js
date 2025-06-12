import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { createServer } from "http"
import { Server } from "socket.io"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import assessmentRoutes from "./routes/assessments.js"
import skillRoutes from "./routes/skills.js"
import opportunityRoutes from "./routes/opportunities.js"
import chatRoutes from "./routes/chat.js"
import aiRoutes from "./routes/ai.js"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB()


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/assessments", assessmentRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/opportunities", opportunityRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/ai", aiRoutes)

// Socket.IO for real-time chat
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
  })

  socket.on("send-message", (data) => {
    socket.to(data.roomId).emit("receive-message", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
