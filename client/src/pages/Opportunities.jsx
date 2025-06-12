"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import {
  Plus,
  MapPin,
  Users,
  Briefcase,
  Search,
  Filter,
  X,
  Star,
  DollarSign,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  Edit3,
} from "lucide-react"
import { Link } from "react-router-dom"

const Opportunities = () => {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    experience: "",
    search: "",
    myOpportunities: false,
  })

  // Add debouncing to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOpportunities()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/opportunities?${params}`)
      setOpportunities(response.data.opportunities)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load opportunities")
      setLoading(false)
    }
  }

  const handleApply = async (opportunityId) => {
    try {
      await axios.post(`/api/opportunities/${opportunityId}/apply`, {
        coverLetter: "I'm interested in this opportunity and believe I'm a good fit.",
      })
      toast.success("Application submitted successfully!")

      // Update the local state immediately to reflect the application
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp._id === opportunityId
            ? {
                ...opp,
                applications: [...(opp.applications || []), { userId: user._id }],
              }
            : opp,
        ),
      )

      // Also refresh from server to get the complete updated data
      fetchOpportunities()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply")
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
      type: "",
      location: "",
      experience: "",
      search: "",
      myOpportunities: false,
    })
  }

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      job: "from-blue-100 to-blue-200 text-blue-700 border-blue-300",
      internship: "from-green-100 to-green-200 text-green-700 border-green-300",
      project: "from-purple-100 to-purple-200 text-purple-700 border-purple-300",
      mentorship: "from-orange-100 to-orange-200 text-orange-700 border-orange-300",
    }
    return colors[type] || "from-gray-100 to-gray-200 text-gray-700 border-gray-300"
  }

  const getExperienceColor = (level) => {
    const colors = {
      entry: "bg-green-100 text-green-700",
      mid: "bg-blue-100 text-blue-700",
      senior: "bg-purple-100 text-purple-700",
      expert: "bg-red-100 text-red-700",
    }
    return colors[level] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
                  Opportunities 💼
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Discover jobs, internships, and projects that match your skills
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <Filter size={18} />
                  <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                </button>
                {user.role === "mentor" && (
                  <Link
                    to="/opportunities/create"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Post Opportunity</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Filter Opportunities</h2>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm font-medium"
              >
                <X size={16} />
                <span>Clear all</span>
              </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search opportunities..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="mentorship">Mentorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={filters.experience}
                    onChange={(e) => handleFilterChange("experience", e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="expert">Expert Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                {user.role === "mentor" && (
                  <div className="flex items-end">
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out mr-3 rounded"
                        checked={filters.myOpportunities}
                        onChange={(e) => handleFilterChange("myOpportunities", e.target.checked)}
                      />
                      My Opportunities Only
                    </label>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Opportunities List */}
        <div className="space-y-6">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <div
                key={opportunity._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                      <span
                        className={`px-3 py-1 bg-gradient-to-r ${getTypeColor(opportunity.type)} rounded-full text-sm font-medium capitalize border`}
                      >
                        {opportunity.type}
                      </span>
                      {opportunity.matchScore && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300 rounded-full text-sm font-medium flex items-center">
                          <Star size={14} className="mr-1" />
                          {opportunity.matchScore}% Match
                        </span>
                      )}
                      {opportunity.featured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">{opportunity.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Users size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Posted by</p>
                          <p>
                            {opportunity.createdBy.firstName} {opportunity.createdBy.lastName}
                          </p>
                        </div>
                      </div>
                      {opportunity.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <MapPin size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <p>{opportunity.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Calendar size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Posted</p>
                          <p>{new Date(opportunity.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <Briefcase size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Experience</p>
                          <span
                            className={`px-2 py-1 ${getExperienceColor(opportunity.experienceLevel)} rounded-full text-xs font-medium capitalize`}
                          >
                            {opportunity.experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Required Skills */}
                    {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium"
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Salary Range */}
                    {opportunity.salaryRange && (
                      <div className="flex items-center text-sm text-gray-700 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <div>
                          <span className="font-semibold">Salary: </span>
                          <span className="text-green-600 font-medium">
                            {opportunity.salaryRange.currency} {opportunity.salaryRange.min?.toLocaleString()} -{" "}
                            {opportunity.salaryRange.max?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 mt-6 lg:mt-0 lg:ml-6 flex-shrink-0">
                    {user.role === "learner" && (
                      <>
                        {opportunity.applications?.some((app) => app.userId === user._id) ? (
                          <div className="flex items-center justify-center px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
                            <CheckCircle size={18} className="mr-2" />
                            Applied
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(opportunity._id)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                          >
                            <ArrowUpRight size={18} />
                            <span>Apply Now</span>
                          </button>
                        )}
                      </>
                    )}
                    {user.role === "mentor" && opportunity.createdBy._id === user._id && (
                      <>
                        <Link
                          to={`/opportunities/edit/${opportunity._id}`}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                        >
                          <Edit3 size={18} />
                          <span>Edit</span>
                        </Link>
                        <Link
                          to={`/opportunities/${opportunity._id}/applications`}
                          className="px-6 py-3 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                        >
                          <Users size={18} />
                          <span>Applications</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No opportunities found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or check back later for new opportunities that match your skills.
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

        {/* Load More */}
        {opportunities.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-blue-100/50 border border-blue-100/50 px-8 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
              Load More Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Opportunities
