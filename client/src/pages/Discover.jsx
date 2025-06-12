"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import {
  User,
  Search,
  MapPin,
  Briefcase,
  UserPlus,
  Check,
  Clock,
  MessageCircle,
  Filter,
  X,
  Star,
  ArrowUpRight,
  Bell,
  UserCheck,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"

const Discover = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [filters, setFilters] = useState({
    skills: "",
    experience: "",
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300) 

    return () => clearTimeout(timeoutId)
  }, [filters])

  useEffect(() => {
    fetchRequests()
    fetchUsers()
  }, []) 

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true)
      const response = await axios.get("/api/users/requests/received")
      setReceivedRequests(response.data.requests || [])
      setRequestsLoading(false)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      setRequestsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/users/discover?${params}`)
      setUsers(response.data.users)
      setLoading(false)
      console.log("Current user:", currentUser)
      console.log("Fetched users:", response.data.users)
    } catch (error) {
      toast.error("Failed to load users")
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      skills: "",
      experience: "",
      search: "",
    })
  }

  const handleConnect = async (userId) => {
    try {
      const response = await axios.post(`/api/users/connect/${userId}`)
      toast.success(response.data.message)
      fetchUsers() 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send connection request")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/accept`)
      toast.success("Connection request accepted!")
      fetchRequests() 
      fetchUsers() 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/reject`)
      toast.success("Connection request rejected.")
      fetchRequests() 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request")
    }
  }

  const startChat = (userId) => {
    const roomId = [currentUser._id, userId].sort().join("-")
    window.location.href = `/chat/${roomId}`
  }

  const getRandomGradient = (index) => {
    const gradients = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-teal-500",
      "from-yellow-400 to-orange-500",
      "from-red-400 to-pink-500",
      "from-indigo-400 to-purple-500",
    ]
    return gradients[index % gradients.length]
  }

  const navigateToProfile = (userId) => {
    navigate(`/profile/view/${userId}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Discover {currentUser.role === "learner" ? "Mentors" : "Learners"} 🔍
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Find individuals who can help you grow or whom you can mentor.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                >
                  <Filter size={18} />
                  <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Filter Results</h2>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm font-medium"
              >
                <X size={16} />
                <span>Clear all</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or bio..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js"
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange("skills", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Experience (Years)</label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>
        )}

        {/* Connection Requests Section */}
        {!requestsLoading && receivedRequests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Connection Requests</h2>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                {receivedRequests.length}
              </span>
            </div>

            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex items-center md:block">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                        >
                          <span className="text-xl font-bold text-white">
                            {request.sender.firstName?.[0]}
                            {request.sender.lastName?.[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h3 className="text-xl font-bold text-gray-900 group">
                            <button
                              onClick={() => navigateToProfile(request.sender._id)}
                              className="hover:text-blue-600 transition-colors flex items-center text-left"
                            >
                              {request.sender.firstName} {request.sender.lastName}
                              <ArrowUpRight
                                size={16}
                                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          </h3>
                          <div className="flex items-center mt-1 md:mt-0">
                            <span
                              className={`px-3 py-1 ${request.sender.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} rounded-full text-xs font-medium capitalize`}
                            >
                              {request.sender.role}
                            </span>
                            {request.sender.verified && (
                              <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                                <Check size={12} className="mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {request.sender.bio && <p className="text-gray-700 mt-3 line-clamp-2">{request.sender.bio}</p>}

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-4">
                          {request.sender.location && (
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2 text-blue-500" />
                              <span>{request.sender.location}</span>
                            </div>
                          )}
                          {request.sender.experience && (
                            <div className="flex items-center">
                              <Briefcase size={16} className="mr-2 text-blue-500" />
                              <span>{request.sender.experience} years experience</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-yellow-700 font-medium flex items-center">
                            <Clock size={16} className="mr-2" />
                            Sent request {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-6 md:mt-0 md:ml-6">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <UserCheck size={18} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <XCircle size={18} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Discover {currentUser.role === "learner" ? "Mentors" : "Learners"}
            </h2>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
              <LoadingSpinner />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-6">
              {users.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex-1 flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex items-center md:block">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${getRandomGradient(index)} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                        >
                          <span className="text-xl font-bold text-white">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </span>
                        </div>
                        {user.connectionStatus === "connected" && (
                          <div className="md:mt-2 ml-4 md:ml-0 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center justify-center md:w-full">
                            <Check size={12} className="mr-1" />
                            Connected
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h3 className="text-xl font-bold text-gray-900 group">
                            <button
                              onClick={() => navigateToProfile(user._id)}
                              className="hover:text-blue-600 transition-colors flex items-center text-left"
                            >
                              {user.firstName} {user.lastName}
                              <ArrowUpRight
                                size={16}
                                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          </h3>
                          <div className="flex items-center mt-1 md:mt-0">
                            <span
                              className={`px-3 py-1 ${user.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} rounded-full text-xs font-medium capitalize`}
                            >
                              {user.role}
                            </span>
                            {user.verified && (
                              <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                                <Check size={12} className="mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {user.bio && <p className="text-gray-700 mt-3 line-clamp-2">{user.bio}</p>}

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-4">
                          {user.location && (
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2 text-blue-500" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          {user.experience && (
                            <div className="flex items-center">
                              <Briefcase size={16} className="mr-2 text-blue-500" />
                              <span>{user.experience} years experience</span>
                            </div>
                          )}
                          {user.rating && (
                            <div className="flex items-center">
                              <Star size={16} className="mr-2 text-yellow-500" />
                              <span>{user.rating} rating</span>
                            </div>
                          )}
                        </div>

                        {user.expertise && user.expertise.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise:</h4>
                            <div className="flex flex-wrap gap-2">
                              {user.expertise.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 mt-6 md:mt-0 md:ml-6 flex-shrink-0">
                      {user._id === currentUser._id ? (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center justify-center">
                          Your Profile
                        </span>
                      ) : user.connectionStatus === "connected" ? (
                        <>
                          <button
                            onClick={() => startChat(user._id)}
                            className="flex-1 md:flex-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                          >
                            <MessageCircle size={18} />
                            <span>Message</span>
                          </button>
                          <button
                            onClick={() => navigateToProfile(user._id)}
                            className="flex-1 md:flex-auto px-4 py-3 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                          >
                            <User size={18} />
                            <span>View Profile</span>
                          </button>
                        </>
                      ) : user.connectionStatus === "pending_sent" ? (
                        <span className="px-4 py-3 bg-yellow-100 text-yellow-800 rounded-xl text-sm font-medium flex items-center justify-center space-x-2">
                          <Clock size={18} />
                          <span>Request Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnect(user._id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <UserPlus size={18} />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No users found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or check back later for new{" "}
                {currentUser.role === "learner" ? "mentors" : "learners"}.
              </p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg inline-flex items-center space-x-2"
              >
                <X size={18} />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Pagination or Load More (if needed) */}
        {users.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-blue-100/50 border border-blue-100/50 px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
