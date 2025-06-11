"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import BehaviorResults from "./BehaviorResults"

export default function Dashboard() {
  const { user } = useAuth()
  const [assessmentData, setAssessmentData] = useState({
    behaviorVector: null,
    skillVector: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        // Check if behavior vector exists
        const behaviorResponse = await fetch(`/api/behavior-vectors/user/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        // Check if skill vector exists
        const skillResponse = await fetch(`/api/skill-vectors/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        setAssessmentData({
          behaviorVector: behaviorResponse.ok ? await behaviorResponse.json() : null,
          skillVector: skillResponse.ok ? await skillResponse.json() : null,
        })
      } catch (error) {
        console.error("Error fetching assessment data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchAssessmentData()
    }
  }, [user?.id])

  // Transform skill data for radar chart
  const skillChartData = assessmentData.skillVector
    ? [
        {
          skill: "Logical Reasoning",
          value: assessmentData.skillVector.logical_reasoning,
          fullMark: 10,
        },
        {
          skill: "Creativity",
          value: assessmentData.skillVector.creativity,
          fullMark: 10,
        },
        {
          skill: "Communication",
          value: assessmentData.skillVector.communication,
          fullMark: 10,
        },
        {
          skill: "Collaboration",
          value: assessmentData.skillVector.collaboration,
          fullMark: 10,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const behaviorCompleted = !!assessmentData.behaviorVector
  const skillsCompleted = !!assessmentData.skillVector

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to SkillSphere</h1>
          <p className="mt-2 text-gray-600">
            Discover your unique skill profile through our Quantum Skill Mapping™ and Behavioral Resonance Matching™
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Behavior Assessment Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      behaviorCompleted ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    {behaviorCompleted ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Behavioral Assessment</h3>
                  <p className="text-sm text-gray-500">
                    {behaviorCompleted
                      ? "Your behavioral profile analysis"
                      : "Discover your behavioral patterns and work style"}
                  </p>
                </div>
              </div>

              {behaviorCompleted && assessmentData.behaviorVector ? (
                <div className="space-y-4">
                  <BehaviorResults behaviorVector={assessmentData.behaviorVector} />
                  <Link
                    to="/assessment/behavior"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Retake Assessment
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    to="/assessment/behavior"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Assessment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Skill Assessment Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      skillsCompleted ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {skillsCompleted ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Skill Assessment</h3>
                  <p className="text-sm text-gray-500">
                    {skillsCompleted ? "Your skill profile visualization" : "Evaluate your technical and soft skills"}
                  </p>
                </div>
              </div>

              {skillsCompleted && assessmentData.skillVector ? (
                <div className="space-y-4">
                  {/* Spider Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} tickCount={6} />
                        <Radar
                          name="Skills"
                          dataKey="value"
                          stroke="#4F46E5"
                          fill="#4F46E5"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Skill Bars */}
                  <div className="space-y-3">
                    {Object.entries(assessmentData.skillVector)
                      .filter(([key]) => !["user_id", "_id", "__v", "updated_at"].includes(key))
                      .map(([skill, value]) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {skill.replace("_", " ")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(value * 10, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                              {value.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Link
                    to="/assessment/skills"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Retake Assessment
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    to="/assessment/skills"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                  >
                    Coming Soon
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-900">
                  <span>Assessment Completion</span>
                  <span>
                    {behaviorCompleted && skillsCompleted
                      ? "100%"
                      : behaviorCompleted || skillsCompleted
                        ? "50%"
                        : "0%"}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        behaviorCompleted && skillsCompleted
                          ? "100%"
                          : behaviorCompleted || skillsCompleted
                            ? "50%"
                            : "0%"
                      }`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Assessment Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${behaviorCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span className="text-sm text-gray-700">Behavioral Assessment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${skillsCompleted ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span className="text-sm text-gray-700">Skill Assessment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {(behaviorCompleted || skillsCompleted) && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personalized Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">Learning Path</h4>
                <p className="text-sm text-gray-600">
                  Based on your {behaviorCompleted ? "behavioral profile" : "current progress"}, we recommend focusing
                  on collaborative projects.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">Skill Development</h4>
                <p className="text-sm text-gray-600">
                  {skillsCompleted
                    ? "Continue building your strongest skills while addressing areas for improvement."
                    : "Complete your skill assessment to get personalized recommendations."}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">Career Opportunities</h4>
                <p className="text-sm text-gray-600">
                  Your profile matches well with {user?.role === "learner" ? "internship" : "project"} opportunities in
                  technology.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
