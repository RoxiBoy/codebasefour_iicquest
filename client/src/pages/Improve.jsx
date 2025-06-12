"use client"

import { useEffect, useState } from "react"
import axios from "../contexts/axios"

const Improve = () => {
  const [behavioralData, setBehavioralData] = useState(null)
  const [aiResponse, setAiResponse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAssessmentData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/assessments/assesment")
      const responses = response.data.assessment.responses
      const skillsAssessed = response.data.assessment.skillsAssessed
      const finalData = {
        responses: responses,
        skillsAssessed: skillsAssessed,
      }
      setBehavioralData(finalData)
      return finalData
    } catch (err) {
      console.log("Error fetching assessment data: ", err)
      setError("Failed to fetch assessment data")
      return null
    }
  }

  const fetchAiResponse = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/ai/improvement", data)
      console.log("AI Response:", response.data)
      setAiResponse(response.data)
    } catch (err) {
      console.log("Error fetching AI response:", err)
      setError("Failed to get AI recommendations")
    }
  }

  const parseMarkdownResponse = (markdown) => {
    if (!markdown) return []

    const skillSections = markdown.split("### Skill:").filter((section) => section.trim())

    return skillSections.map((section) => {
      const nameMatch = section.match(/^([^*]+)/)
      const name = nameMatch ? nameMatch[1].trim() : ""

      const scoreMatch = section.match(/\*\*Score:\*\* ([\d.]+)/)
      const score = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 0

      const summaryMatch = section.match(/_Summary_: ([^*]+)/)
      const summary = summaryMatch ? summaryMatch[1].trim() : ""

      const tipsSection = section.split("**Tips to Improve:**")[1]
      const tips = tipsSection
        ? tipsSection
            .split("- **")
            .filter((tip) => tip.trim())
            .map((tip) => {
              const cleanTip = tip.replace(/\*\*/g, "").trim()
              return cleanTip
            })
        : []

      return { name, score, summary, tips }
    })
  }

  const getScoreColor = (score) => {
    if (score >= 0.7) return "text-green-600 bg-green-100"
    if (score >= 0.5) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getScoreLabel = (score) => {
    if (score >= 0.7) return "Strong"
    if (score >= 0.5) return "Moderate"
    return "Needs Improvement"
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const assessmentData = await fetchAssessmentData()

      if (assessmentData) {
        await fetchAiResponse(assessmentData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your improvement suggestions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const skills = parseMarkdownResponse(aiResponse?.markdown || "")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Improvement Suggestions</h1>
          <p className="text-gray-600">Personalized recommendations based on your assessment</p>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {skills.map((skill, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {/* Skill Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">{skill.name}</h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(skill.score)}`}>
                    {getScoreLabel(skill.score)}
                  </div>
                </div>

                {/* Score Bar */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Score:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        skill.score >= 0.7 ? "bg-green-500" : skill.score >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${skill.score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{(skill.score * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Skill Content */}
              <div className="px-6 py-4">
                {/* Summary */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{skill.summary}</p>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tips to Improve</h3>
                  <ul className="space-y-3">
                    {skill.tips.map((tip, tipIndex) => {
                      const [title, ...description] = tip.split(":")
                      return (
                        <li key={tipIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <div className="text-sm">
                            {description.length > 0 ? (
                              <>
                                <span className="font-medium text-gray-900">{title}:</span>
                                <span className="text-gray-600 ml-1">{description.join(":")}</span>
                              </>
                            ) : (
                              <span className="text-gray-600">{title}</span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {skills.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
            <p className="text-gray-600">Complete your assessment to receive personalized improvement suggestions.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Improve

