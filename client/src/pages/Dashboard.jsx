"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import { Users, BookOpen, Target, TrendingUp, MessageCircle, Briefcase, Plus, Eye, Check, XCircle } from "lucide-react"
import SkillRadarChart from "../components/SkillRadarChart"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [myOpportunities, setMyOpportunities] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get("/api/users/stats"),
        axios.get("/api/users/activity"),
      ])

      setStats(statsRes.data)
      setRecentActivity(activityRes.data.activities || [])

      // Fetch mentor-specific data
      if (user.role === "mentor") {
        const opportunitiesRes = await axios.get("/api/opportunities/my-opportunities")
        setMyOpportunities(opportunitiesRes.data.opportunities || [])
      }

      // Fetch received connection requests for all users
      const requestsRes = await axios.get("/api/users/requests/received")
      setReceivedRequests(requestsRes.data.requests || [])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/accept`)
      toast.success("Connection request accepted!")
      fetchDashboardData() // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/reject`)
      toast.success("Connection request rejected.")
      fetchDashboardData() // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request")
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-600 mt-2">
            {user.role === "mentor"
              ? "Manage your opportunities and connect with talented learners"
              : "Continue your learning journey and discover new opportunities"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.connections || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === "mentor" ? "Opportunities Posted" : "Skills Mastered"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === "mentor" ? stats.opportunitiesPosted || 0 : stats.skillsMastered || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === "mentor" ? "Applications Received" : "Assessments Completed"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === "mentor" ? stats.applicationsReceived || 0 : stats.assessmentsCompleted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.growthScore || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Connection Requests */}
            {receivedRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Connection Requests</h2>
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">{request.sender.firstName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.sender.firstName} {request.sender.lastName}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{request.sender.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="p-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Dashboard */}
            {user.role === "mentor" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Opportunities</h2>
                  <Link to="/opportunities/create" className="btn-primary flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Post New</span>
                  </Link>
                </div>

                {myOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {myOpportunities.slice(0, 3).map((opportunity) => (
                      <div key={opportunity._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{opportunity.description.substring(0, 100)}...</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="capitalize">{opportunity.type}</span>
                              <span>•</span>
                              <span>{opportunity.applicationCount || 0} applications</span>
                              {opportunity.pendingCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-600 font-medium">
                                    {opportunity.pendingCount} pending
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Link
                              to={`/opportunities/${opportunity._id}/applications`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                              title="View Applications"
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities posted yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by posting your first opportunity to connect with learners.
                    </p>
                    <Link to="/opportunities/create" className="btn-primary">
                      Post Your First Opportunity
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Learner Dashboard */}
            {user.role === "learner" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/assessment/behavioral" // Link to a specific assessment type
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <Target className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Take Assessment</h3>
                    <p className="text-sm text-gray-600">Discover your skill strengths and areas for improvement</p>
                  </Link>
                  <Link
                    to="/opportunities"
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <Briefcase className="w-8 h-8 text-green-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Browse Opportunities</h3>
                    <p className="text-sm text-gray-600">Find jobs and projects that match your skills</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recent activity to show.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skill DNA Chart - Only for Learners */}
            {user.role === "learner" && user.skillDNA && user.skillDNA.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Skill DNA</h2>
                <SkillRadarChart skills={user.skillDNA} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Edit Profile</span>
                  </div>
                </Link>
                <Link
                  to="/discover"
                  className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Find Connections</span>
                  </div>
                </Link>
                <Link to="/chat" className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Messages</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

