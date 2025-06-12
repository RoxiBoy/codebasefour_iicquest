"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Target,
  TrendingUp,
  MessageCircle,
  Briefcase,
  Plus,
  Eye,
  Check,
  XCircle,
  Award,
  Clock,
  ArrowUpRight,
  Zap,
  Star,
  RefreshCw,
} from "lucide-react"
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
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const [statsRes, activityRes, historicalRes, achievementsRes] = await Promise.all([
        axios.get("/api/users/stats"),
        axios.get("/api/users/activity"),
        axios.get("/api/users/stats/historical"),
        axios.get("/api/users/achievements/current"),
      ])

      setRecentActivity(activityRes.data.activities || [])

      const currentStats = statsRes.data
      const previousStats = historicalRes.data

      const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) {
          if (current > 0) return { change: 100, period: "this month" }
          return { change: 0, period: "this month" }
        }
        const change = ((current - previous) / previous) * 100
        return {
          change: Math.round(change),
          period: historicalRes.data.period || "this month",
        }
      }

      const connectionsChange = calculatePercentageChange(currentStats.connections || 0, previousStats.connections || 0)

      const opportunitiesChange = calculatePercentageChange(
        user.role === "mentor" ? currentStats.opportunitiesPosted || 0 : currentStats.skillsMastered || 0,
        user.role === "mentor" ? previousStats.opportunitiesPosted || 0 : previousStats.skillsMastered || 0,
      )

      const applicationsChange = calculatePercentageChange(
        user.role === "mentor" ? currentStats.applicationsReceived || 0 : currentStats.assessmentsCompleted || 0,
        user.role === "mentor" ? previousStats.applicationsReceived || 0 : previousStats.assessmentsCompleted || 0,
      )

      const growthScoreChange = calculatePercentageChange(currentStats.growthScore || 0, previousStats.growthScore || 0)

      
      setStats({
        ...currentStats,
        connectionsChange,
        opportunitiesChange,
        applicationsChange,
        growthScoreChange,
        currentAchievement: achievementsRes.data?.currentAchievement || null,
      })

      
      if (user.role === "mentor") {
        const opportunitiesRes = await axios.get("/api/opportunities/my-opportunities")
        setMyOpportunities(opportunitiesRes.data.opportunities || [])
      }

     
      const requestsRes = await axios.get("/api/users/requests/received")
      setReceivedRequests(requestsRes.data.requests || [])

      setLoading(false)
      setRefreshing(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
      setRefreshing(false)
      toast.error("Failed to load dashboard data")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/accept`)
      toast.success("Connection request accepted!")

      
      setReceivedRequests((prev) => prev.filter((request) => request._id !== requestId))

      
      setStats((prev) => ({
        ...prev,
        connections: (prev.connections || 0) + 1,
        connectionsChange: {
          ...prev.connectionsChange,
          change: calculateNewPercentageChange(
            (prev.connections || 0) + 1,
            prev.connections || 0,
            prev.connectionsChange?.change || 0,
          ),
        },
      }))

      
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/reject`)
      toast.success("Connection request rejected.")

    
      setReceivedRequests((prev) => prev.filter((request) => request._id !== requestId))
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request")
    }
  }

  
  const calculateNewPercentageChange = (newValue, oldValue, currentChange) => {
  
    if (oldValue === 0) return 100

    
    const estimatedPrevPeriodValue = oldValue / (1 + currentChange / 100)

    
    const newChange = ((newValue - estimatedPrevPeriodValue) / estimatedPrevPeriodValue) * 100
    return Math.round(newChange)
  }

  const handleRefreshData = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {user.firstName}! 👋
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {user.role === "mentor"
                    ? "Manage your opportunities and connect with talented learners"
                    : "Continue your learning journey and discover new opportunities"}
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 text-blue-600"
                  title="Refresh dashboard data"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.firstName?.[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${user.role === "mentor" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 mb-8`}
        >
          {/* Connections Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Connections</p>
                <p className="text-3xl font-bold text-gray-900">{stats.connections || 0}</p>
                <p
                  className={`text-xs font-medium mt-1 ${
                    stats.connectionsChange?.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.connectionsChange?.change >= 0 ? "+" : ""}
                  {stats.connectionsChange?.change || 0}% {stats.connectionsChange?.period || "this month"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Opportunities/Skills Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {user.role === "mentor" ? "Opportunities" : "Skills"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user.role === "mentor" ? stats.opportunitiesPosted || 0 : stats.skillsMastered || 0}
                </p>
                <p
                  className={`text-xs font-medium mt-1 ${
                    stats.opportunitiesChange?.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.opportunitiesChange?.change >= 0 ? "+" : ""}
                  {stats.opportunitiesChange?.change || 0}% {stats.opportunitiesChange?.period || "this month"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Applications/Assessments Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {user.role === "mentor" ? "Applications" : "Assessments"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user.role === "mentor" ? stats.applicationsReceived || 0 : stats.assessmentsCompleted || 0}
                </p>
                <p
                  className={`text-xs font-medium mt-1 ${
                    stats.applicationsChange?.change >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {stats.applicationsChange?.change >= 0 ? "+" : ""}
                  {stats.applicationsChange?.change || 0}% {stats.applicationsChange?.period || "this month"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Growth Score Card - Only for learners */}
          {user.role === "learner" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Growth Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.growthScore || 0}%</p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      stats.growthScoreChange?.change >= 0 ? "text-orange-600" : "text-red-600"
                    }`}
                  >
                    {stats.growthScoreChange?.change >= 0 ? "+" : ""}
                    {stats.growthScoreChange?.change || 0}% {stats.growthScoreChange?.period || "this month"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Connection Requests */}
            {receivedRequests.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    Pending Connection Requests
                  </h2>
                  <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                    {receivedRequests.length} new
                  </span>
                </div>
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4 text-white font-semibold">
                          <span>{request.sender.firstName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.sender.firstName} {request.sender.lastName}
                          </p>
                          <p className="text-sm text-blue-600 capitalize font-medium">{request.sender.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 hover:scale-105 transition-all duration-200"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 hover:scale-105 transition-all duration-200"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Dashboard */}
            {user.role === "mentor" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Briefcase className="w-6 h-6 text-blue-600 mr-3" />
                    My Opportunities
                  </h2>
                  <Link
                    to="/opportunities/create"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Post New</span>
                  </Link>
                </div>

                {myOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {myOpportunities.slice(0, 3).map((opportunity) => (
                      <div
                        key={opportunity._id}
                        className="border border-blue-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{opportunity.title}</h3>
                            <p className="text-gray-600 mb-4">{opportunity.description.substring(0, 120)}...</p>
                            <div className="flex items-center space-x-6 text-sm">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium capitalize">
                                {opportunity.type}
                              </span>
                              <span className="flex items-center text-gray-600">
                                <Users size={16} className="mr-1" />
                                {opportunity.applicationCount || 0} applications
                              </span>
                              {opportunity.pendingCount > 0 && (
                                <span className="flex items-center text-orange-600 font-medium">
                                  <Clock size={16} className="mr-1" />
                                  {opportunity.pendingCount} pending
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/opportunities/${opportunity._id}/applications`}
                            className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200 group"
                            title="View Applications"
                          >
                            <Eye size={20} className="group-hover:scale-110 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities posted yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start by posting your first opportunity to connect with talented learners and grow your network.
                    </p>
                    <Link
                      to="/opportunities/create"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg inline-flex items-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>Post Your First Opportunity</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Learner Dashboard */}
            {user.role === "learner" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-3" />
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link
                    to="/assessment/behavioral"
                    className="group p-6 border border-blue-200 rounded-xl hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-white to-blue-50/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Take Behavioral Assessment</h3>
                    <p className="text-sm text-gray-600">Discover your skill strengths and areas for improvement</p>
                  </Link>
                  <Link
                    to="/assessment/skill"
                    className="group p-6 border border-blue-200 rounded-xl hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-white to-blue-50/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <ClipboardCheck className="w-8 h-8 text-blue-600" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Take Skills Assessment</h3>
                    <p className="text-sm text-gray-600">Find what skills you have and what you need to work on.</p>
                  </Link>

                  <Link
                    to="/opportunities"
                    className="group p-6 border border-green-200 rounded-xl hover:border-green-400 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-white to-green-50/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                        <Briefcase className="w-8 h-8 text-green-600" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Browse Opportunities</h3>
                    <p className="text-sm text-gray-600">Find jobs and projects that match your skills</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 text-purple-600 mr-3" />
                Recent Activity
              </h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl"
                    >
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600">No recent activity to show.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skill DNA Chart - Only for Learners */}
            {user.role === "learner" && user.skillDNA && user.skillDNA.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Zap className="w-6 h-6 text-yellow-500 mr-3" />
                  Your Skill DNA
                </h2>
                <SkillRadarChart skills={user.skillDNA} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Edit Profile</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
                <Link
                  to="/discover"
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors mr-3">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Find Connections</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </Link>
                <Link
                  to="/chat"
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-purple-50 transition-all duration-200 border border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors mr-3">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Messages</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Achievement Badge - Only for Learners with Active Achievements */}
            {user.role === "learner" && stats.currentAchievement && (
              <div
                className={`rounded-2xl shadow-lg p-6 text-white ${
                  stats.currentAchievement.gradient || "bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8" />
                  {stats.currentAchievement.isNew && (
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">New!</span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{stats.currentAchievement.title}</h3>
                <p className="text-sm opacity-90 mb-4">{stats.currentAchievement.description}</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.currentAchievement.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2 opacity-75">
                  {stats.currentAchievement.remainingCount} more to unlock "{stats.currentAchievement.nextAchievement}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
