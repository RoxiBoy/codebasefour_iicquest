import express from "express"
import Assessment from "../models/Assessment.js"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/questions/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params

    let questions = []

    if (type === "behavioral") {
      questions = [
        {
          questionId: "b1",
          type: "behavioral",
          category: "communication",
          question: "When working on a team project, how do you typically handle disagreements?",
          options: [
            "I try to find a compromise that works for everyone",
            "I present my viewpoint clearly and stick to it",
            "I prefer to let others lead the discussion",
            "I focus on finding the most logical solution",
          ],
        },
        {
          questionId: "b2",
          type: "behavioral",
          category: "leadership",
          question: "You notice a team member struggling with their tasks. What do you do?",
          options: [
            "Offer to help them directly",
            "Suggest they ask the team lead for guidance",
            "Share resources that might help them",
            "Wait to see if they figure it out on their own",
          ],
        },
        {
          questionId: "b3",
          type: "behavioral",
          category: "adaptability",
          question: "How do you react when project requirements change suddenly?",
          options: [
            "I adapt quickly and help others adjust",
            "I need time to process the changes",
            "I question the reasoning behind the changes",
            "I focus on what aspects remain the same",
          ],
        },
        {
          questionId: "b4",
          type: "behavioral",
          category: "problem-solving",
          question: "When facing a complex problem, what is your first approach?",
          options: [
            "Break it down into smaller, manageable parts",
            "Research similar problems and solutions",
            "Brainstorm with others for different perspectives",
            "Try different solutions until one works",
          ],
        },
        {
          questionId: "b5",
          type: "behavioral",
          category: "collaboration",
          question: "In group settings, you typically:",
          options: [
            "Take charge and organize the group",
            "Contribute ideas when asked",
            "Focus on supporting others' ideas",
            "Work independently on assigned tasks",
          ],
        },
        {
          questionId: "b6",
          type: "behavioral",
          category: "stress-management",
          question: "When under pressure with tight deadlines, you:",
          options: [
            "Prioritize tasks and work systematically",
            "Ask for help or additional resources",
            "Work longer hours to meet the deadline",
            "Communicate potential delays early",
          ],
        },
        {
          questionId: "b7",
          type: "behavioral",
          category: "learning",
          question: "How do you prefer to learn new skills?",
          options: [
            "Hands-on practice and experimentation",
            "Reading documentation and guides",
            "Learning from mentors or colleagues",
            "Taking structured courses or training",
          ],
        },
        {
          questionId: "b8",
          type: "behavioral",
          category: "feedback",
          question: "When receiving constructive criticism, you:",
          options: [
            "Welcome it as an opportunity to improve",
            "Need time to process it before responding",
            "Ask clarifying questions to understand better",
            "Sometimes feel defensive initially",
          ],
        },
        {
          questionId: "b9",
          type: "behavioral",
          category: "innovation",
          question: "When approaching a routine task, you:",
          options: [
            "Look for ways to improve or optimize it",
            "Follow established procedures carefully",
            "Complete it efficiently and move on",
            "Consider if it's necessary at all",
          ],
        },
        {
          questionId: "b10",
          type: "behavioral",
          category: "communication",
          question: "In meetings, you typically:",
          options: [
            "Actively participate and share ideas",
            "Listen carefully and speak when necessary",
            "Ask questions to clarify understanding",
            "Take notes and follow up later",
          ],
        },
      ]
    } else if (type === "technical") {
      questions = [
        {
          questionId: "t1",
          type: "technical",
          category: "math",
          question:
            "If a train travels 120 miles in 2 hours, and then 180 miles in 3 hours, what is its average speed for the entire journey?",
          options: ["60 mph", "65 mph", "70 mph", "75 mph"],
          correctAnswer: "60 mph",
          timeLimit: 180,
        },
        {
          questionId: "t2",
          type: "technical",
          category: "reasoning",
          question: "In a sequence: 2, 6, 12, 20, 30, ?, what is the next number?",
          options: ["40", "42", "44", "46"],
          correctAnswer: "42",
          timeLimit: 120,
        },
        {
          questionId: "t3",
          type: "technical",
          category: "math",
          question:
            "A rectangle has a length of 15 cm and a width of 8 cm. If the length is increased by 20% and the width is decreased by 10%, what is the new area?",
          options: ["162 cm²", "144 cm²", "135 cm²", "150 cm²"],
          correctAnswer: "162 cm²",
          timeLimit: 240,
        },
        {
          questionId: "t4",
          type: "technical",
          category: "reasoning",
          question: "If all Bloops are Razzles and all Razzles are Lazzles, which statement must be true?",
          options: [
            "All Lazzles are Bloops",
            "All Bloops are Lazzles",
            "Some Lazzles are not Razzles",
            "No Bloops are Lazzles",
          ],
          correctAnswer: "All Bloops are Lazzles",
          timeLimit: 150,
        },
        {
          questionId: "t5",
          type: "technical",
          category: "math",
          question: "What is 15% of 240?",
          options: ["32", "36", "40", "44"],
          correctAnswer: "36",
          timeLimit: 90,
        },
      ]
    } else if (type === "communication") {
      questions = [
        {
          questionId: "c1",
          type: "communication",
          category: "scenario",
          question:
            "You need to explain a technical concept to a non-technical stakeholder. How would you approach this?",
          options: [
            "Use analogies and real-world examples",
            "Provide detailed technical documentation",
            "Create visual diagrams and flowcharts",
            "Schedule a hands-on demonstration",
          ],
        },
        {
          questionId: "c2",
          type: "communication",
          category: "scenario",
          question: "A client is upset about a project delay. How do you handle the situation?",
          options: [
            "Acknowledge their concerns and provide a clear timeline",
            "Explain the technical reasons for the delay",
            "Offer compensation or additional services",
            "Schedule a meeting with the project manager",
          ],
        },
        {
          questionId: "c3",
          type: "communication",
          category: "scenario",
          question: "You disagree with your team lead's approach to a project. What do you do?",
          options: [
            "Request a private meeting to discuss your concerns",
            "Present alternative solutions in the next team meeting",
            "Follow their approach but document your concerns",
            "Seek input from other team members first",
          ],
        },
      ]
    }

    res.json({ questions })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/submit", authenticateToken, async (req, res) => {
  try {
    const { type, responses, sessionData } = req.body
    const userId = req.user.userId

    const assessment = new Assessment({
      userId,
      type,
      sessionId: sessionData.sessionId,
      startTime: new Date(sessionData.startTime),
      endTime: new Date(),
      responses: responses.map((response) => ({
        ...response,
        timeTaken: response.timeTaken || 0,
        interactionData: response.interactionData || {},
      })),
      status: "completed",
    })

    assessment.totalDuration = Math.floor((assessment.endTime - assessment.startTime) / 1000)

    assessment.aiAnalysisData = {
      responsePatterns: responses.map((r) => ({
        questionId: r.questionId,
        response: r.userResponse,
        timeTaken: r.timeTaken,
        interactionData: r.interactionData,
      })),
      timingAnalysis: {
        totalTime: assessment.totalDuration,
        averageTimePerQuestion: assessment.totalDuration / responses.length,
        timeDistribution: responses.map((r) => r.timeTaken),
      },
      behavioralMetrics: {
        hesitationPatterns: responses.map((r) => r.interactionData?.hesitationTime || 0),
        changesMade: responses.reduce((sum, r) => sum + (r.interactionData?.changesMade || 0), 0),
        confidenceLevels: responses.map((r) => r.interactionData?.confidenceLevel || 5),
      },
    }

    await assessment.save()

    await User.findByIdAndUpdate(userId, {
      [`last${type.charAt(0).toUpperCase() + type.slice(1)}Assessment`]: new Date(),
    })

    res.json({
      message: "Assessment submitted successfully",
      assessmentId: assessment._id,
      aiAnalysisData: assessment.aiAnalysisData,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/assesment", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const assessment = await Assessment.findOne({ userId })
        
    res.json({ assessment })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
