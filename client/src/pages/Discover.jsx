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
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Add a separate useEffect for initial load
  useEffect(() => {
    fetchRequests()
    fetchUsers()
  }, []) // Remove filters dependency from here

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
      fetchUsers() // Refresh users to update connection status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send connection request")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/accept`)
      toast.success("Connection request accepted!")
      fetchRequests() // Refresh requests
      fetchUsers() // Refresh users to update connection status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/requests/${requestId}/reject`)
      toast.success("Connection request rejected.")
      fetchRequests() // Refresh requests
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
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Discover {currentUser.role === "learner" ? "Mentors" : "Learners"} 🔍
                </h1>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100/50 p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <input
                type="text"
                placeholder="Skills"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <input
                type="number"
                placeholder="Min. Experience"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.experience}
                onChange={(e) => handleFilterChange("experience", e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center space-x-1"
              >
                <X size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-32 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100/50">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-1">
            {/* Connection Requests - Inline with users */}
            {!requestsLoading && receivedRequests.length > 0 && (
              <>
                {receivedRequests.map((request) => (
                  <div
                    key={`request-${request._id}`}
                    className="bg-yellow-50/80 backdrop-blur-sm rounded-xl shadow-md border border-yellow-200/50 p-3 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {request.sender.firstName?.[0]}
                            {request.sender.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => navigateToProfile(request.sender._id)}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                            >
                              {request.sender.firstName} {request.sender.lastName}
                            </button>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                Request
                              </span>
                              <span
                                className={`px-2 py-0.5 ${request.sender.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} rounded-full text-xs font-medium`}
                              >
                                {request.sender.role}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              {request.sender.location && (
                                <span className="flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {request.sender.location}
                                </span>
                              )}
                              {request.sender.experience && (
                                <span className="flex items-center">
                                  <Briefcase size={12} className="mr-1" />
                                  {request.sender.experience}y
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1"
                              >
                                <UserCheck size={12} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1"
                              >
                                <XCircle size={12} />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Users List */}
            {users.length > 0 ? (
              <>
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100/50 p-3 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${getRandomGradient(index)} rounded-lg flex items-center justify-center shadow-sm`}
                          >
                            <span className="text-sm font-bold text-white">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </span>
                          </div>
                          {user.connectionStatus === "connected" && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => navigateToProfile(user._id)}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate group flex items-center"
                            >
                              {user.firstName} {user.lastName}
                              <ArrowUpRight
                                size={12}
                                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                            <div className="flex items-center space-x-2 ml-2">
                              <span
                                className={`px-2 py-0.5 ${user.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} rounded-full text-xs font-medium`}
                              >
                                {user.role}
                              </span>
                              {user.verified && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                                  <Check size={10} className="mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              {user.location && (
                                <span className="flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {user.location}
                                </span>
                              )}
                              {user.experience && (
                                <span className="flex items-center">
                                  <Briefcase size={12} className="mr-1" />
                                  {user.experience}y
                                </span>
                              )}
                              {user.rating && (
                                <span className="flex items-center">
                                  <Star size={12} className="mr-1 text-yellow-500" />
                                  {user.rating}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {user.expertise && user.expertise.length > 0 && (
                                <div className="flex space-x-1">
                                  {user.expertise.slice(0, 3).map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {user.expertise.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{user.expertise.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        {user._id === currentUser._id ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">You</span>
                        ) : user.connectionStatus === "connected" ? (
                          <>
                            <button
                              onClick={() => startChat(user._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1"
                            >
                              <MessageCircle size={12} />
                              <span>Chat</span>
                            </button>
                          </>
                        ) : user.connectionStatus === "pending_sent" ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs flex items-center space-x-1">
                            <Clock size={12} />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConnect(user._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1"
                          >
                            <UserPlus size={12} />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100/50 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 text-sm mb-4">Try adjusting your filters or check back later.</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center space-x-1"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Load More */}
        {users.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-blue-100/50 px-4 py-2 text-blue-600 text-sm hover:bg-blue-50 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
