"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const questions = [
  {
    id: 1,
    question:
      "If you were to teach a concept or skill to a room full of people with no prior knowledge, what would you teach, and how would you make it engaging and memorable?",
    placeholder: "Describe what you would teach and your approach to making it engaging...",
  },
  {
    id: 2,
    question:
      "What's a belief or assumption you held strongly five years ago that you no longer believe? What changed your mind, and how did that experience shape your approach to learning?",
    placeholder: "Share a belief that changed and how it affected your learning approach...",
  },
  {
    id: 3,
    question:
      "Describe a time when you had to mediate a conflict between two colleagues with opposing views. How did you approach it, and what was the outcome? What did you learn about yourself in the process?",
    placeholder: "Describe the conflict situation and your mediation approach...",
  },
  {
    id: 4,
    question:
      "What's a trend or technology you believe will disrupt our industry in the next five years? How should our company prepare to stay ahead of the curve?",
    placeholder: "Identify a disruptive trend and your preparation strategy...",
  },
  {
    id: 5,
    question:
      "If you could design the ideal company culture, what three core values would you prioritize, and how would you ensure they're lived out daily by the team?",
    placeholder: "List three core values and implementation strategies...",
  },
  {
    id: 6,
    question: "You're assigned a new technology to master within 2 days. What's your exact learning process?",
    placeholder: "Outline your step-by-step learning process...",
  },
  {
    id: 7,
    question: "If I give you 30 minutes to learn a brand-new concept, how will you spend the first 5 minutes?",
    placeholder: "Describe how you would use the first 5 minutes...",
  },
  {
    id: 8,
    question: "You're placed in a team of high-performers with no clear leader. What do you do in the first meeting?",
    placeholder: "Explain your approach to the first team meeting...",
  },
]

export default function BehaviorAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(new Array(questions.length).fill(""))
  const [loading, setLoading] = useState(false)
  const [existingAssessment, setExistingAssessment] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        const response = await fetch(`/api/behavior-vectors/user/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          setExistingAssessment(true)
        }
      } catch (error) {
        console.error("Error checking existing assessment:", error)
      }
    }

    if (user?.id) {
      checkExistingAssessment()
    }
  }, [user?.id])

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/assess-behavior", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          answers: answers,
        }),
      })

      if (response.ok) {
        navigate("/")
      } else {
        throw new Error("Assessment submission failed")
      }
    } catch (error) {
      console.error("Error submitting assessment:", error)
      alert("Failed to submit assessment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isCurrentAnswerValid = answers[currentQuestion]?.trim().length > 0
  const allAnswersComplete = answers.every((answer) => answer.trim().length > 0)

  if (existingAssessment) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600 mb-6">
              You have already completed your behavioral assessment. Your behavioral profile has been analyzed and is
              ready for matching.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Behavioral Assessment</h1>
          <p className="mt-2 text-gray-600">
            Answer these questions thoughtfully to help us understand your behavioral patterns and work style.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white shadow rounded-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{questions[currentQuestion].question}</h2>
          <textarea
            value={answers[currentQuestion]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={questions[currentQuestion].placeholder}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="mt-2 text-sm text-gray-500">{answers[currentQuestion].length} characters</div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentAnswerValid}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswersComplete || loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>

        {/* Question Overview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Question Overview</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium ${
                  index === currentQuestion
                    ? "bg-indigo-600 text-white"
                    : answers[index].trim().length > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
