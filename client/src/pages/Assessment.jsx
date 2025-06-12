"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { Clock, AlertCircle } from "lucide-react"

const Assessment = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [sessionData, setSessionData] = useState({
    sessionId: Date.now().toString(),
    startTime: new Date(),
  })

  const [interactionData, setInteractionData] = useState({
    clickCount: 0,
    keystrokes: 0,
    pauseDuration: 0,
    startTime: Date.now(),
    lastActivity: Date.now(),
  })

  const questionStartTime = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    fetchQuestions()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [type])

  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      const question = questions[currentQuestion]
      if (question.timeLimit) {
        setTimeLeft(question.timeLimit)
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimeUp()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
      questionStartTime.current = Date.now()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestion, questions])

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/api/assessments/questions/${type}`)
      setQuestions(response.data.questions)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load questions. Please try again later.")
      console.error("Error fetching questions:", error)
      setLoading(false)
    }
  }

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    toast.warning("Time's up for this question!")
    handleNext()
  }

  const trackInteraction = (action) => {
    const now = Date.now()
    setInteractionData((prev) => ({
      ...prev,
      clickCount: action === "click" ? prev.clickCount + 1 : prev.clickCount,
      keystrokes: action === "keystroke" ? prev.keystrokes + 1 : prev.keystrokes,
      pauseDuration: prev.pauseDuration + (now - prev.lastActivity > 5000 ? now - prev.lastActivity : 0),
      lastActivity: now,
    }))
  }

  const handleAnswerSelect = (answer) => {
    trackInteraction("click")
    const timeTaken = Date.now() - questionStartTime.current
    const existingResponseIndex = responses.findIndex((r) => r.questionId === questions[currentQuestion].questionId)

    const newResponse = {
      questionId: questions[currentQuestion].questionId,
      userResponse: answer,
      timeTaken,
      startTime: new Date(questionStartTime.current),
      endTime: new Date(),
      interactionData: {
        ...interactionData,
        timeTaken,
        confidenceLevel: 5,
      },
    }

    if (existingResponseIndex >= 0) {
      setResponses((prev) => {
        const updated = [...prev]
        updated[existingResponseIndex] = newResponse
        return updated
      })
    } else {
      setResponses((prev) => [...prev, newResponse])
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await axios.post("/api/assessments/submit", {
        type,
        responses,
        sessionData: {
          ...sessionData,
          endTime: new Date(),
        },
      })

      await axios.post("/api/ai/analyze-assessment", {
        assessmentId: response.data.assessmentId,
      })

      toast.success("Assessment submitted successfully!")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to submit assessment")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600">Please try again later or contact support.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary mt-4">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const hasAnsweredCurrentQuestion = responses.some((r) => r.questionId === questions[currentQuestion]?.questionId)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{type} Assessment</h1>
            {timeLeft !== null && (
              <div className="flex items-center text-orange-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQ.question}</h2>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQ.options?.map((option, index) => {
              const isSelected = responses.some(
                (r) => r.questionId === currentQ.questionId && r.userResponse === option,
              )
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onMouseDown={() => trackInteraction("click")}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 border-2 rounded-full mr-4 flex items-center justify-center ${
                        isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <span className={`${isSelected ? "text-blue-900" : "text-gray-900"}`}>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-500">
              {type === "technical" && currentQ.timeLimit && (
                <span>Time limit: {Math.floor(currentQ.timeLimit / 60)} minutes</span>
              )}
            </div>
            <div className="flex space-x-4">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className={`px-6 py-2 rounded-lg ${
                  hasAnsweredCurrentQuestion
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!hasAnsweredCurrentQuestion}
              >
                {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>
        
      </div>

      {/* Submit Modal */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Submitting Assessment</h3>
              <p className="text-gray-600">Processing your responses...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assessment

