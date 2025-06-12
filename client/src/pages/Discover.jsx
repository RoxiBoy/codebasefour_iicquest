"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { User, Search, MapPin, Briefcase, UserPlus, Check, Clock, MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"

const Discover = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    skills: "",
    experience: "",
    search: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [filters])

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
      toast.success("Connection accepted!")
      fetchUsers() // Refresh users to update connection status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const startChat = (userId) => {
    const roomId = [currentUser.id, userId].sort().join("-")
    window.location.href = `/chat/${roomId}`
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Discover {currentUser.role === "learner" ? "Mentors" : "Learners"}
          </h1>
          <p className="text-gray-600 mt-2">Find individuals who can help you grow or whom you can mentor.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name or bio..."
                  className="pl-10 input-field"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input
                type="text"
                placeholder="e.g., React, Node.js"
                className="input-field"
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Experience (Years)</label>
              <input
                type="number"
                placeholder="e.g., 5"
                className="input-field"
                value={filters.experience}
                onChange={(e) => handleFilterChange("experience", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-6">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-gray-600">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        <Link to={`/profile/view/${user._id}`} className="hover:underline">
                          {user.firstName} {user.lastName}
                        </Link>
                      </h3>
                      <p className="text-gray-600 capitalize">{user.role}</p>
                      {user.bio && <p className="text-gray-700 mt-2 line-clamp-2">{user.bio}</p>}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-3">
                        {user.location && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.experience && (
                          <div className="flex items-center">
                            <Briefcase size={16} className="mr-1" />
                            <span>{user.experience} years experience</span>
                          </div>
                        )}
                      </div>

                      {user.expertise && user.expertise.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Expertise:</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.expertise.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                    {user._id === currentUser.id ? (
                      <span className="px-3 py-2 text-gray-500 text-sm">Your Profile</span>
                    ) : user.connectionStatus === "connected" ? (
                      <>
                        <button onClick={() => startChat(user._id)} className="btn-primary flex items-center space-x-2">
                          <MessageCircle size={16} />
                          <span>Message</span>
                        </button>
                        <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm flex items-center justify-center space-x-1">
                          <Check size={16} />
                          <span>Connected</span>
                        </span>
                      </>
                    ) : user.connectionStatus === "pending_sent" ? (
                      <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm flex items-center justify-center space-x-1">
                        <Clock size={16} />
                        <span>Pending</span>
                      </span>
                    ) : user.connectionStatus === "pending_received" ? (
                      <button
                        onClick={() => handleAcceptRequest(user._id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Check size={16} />
                        <span>Accept</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(user._id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <UserPlus size={16} />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Discover

