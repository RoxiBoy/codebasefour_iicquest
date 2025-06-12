"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { Plus, MapPin, Clock, Users, Briefcase, Search } from "lucide-react"
import { Link } from "react-router-dom"

const Opportunities = () => {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    experience: "",
    search: "",
    myOpportunities: false, // New filter for mentor's own opportunities
  })

  useEffect(() => {
    fetchOpportunities()
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
      fetchOpportunities() // Refresh opportunities to update "Applied" status
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600 mt-2">Discover jobs, internships, and projects that match your skills</p>
          </div>
          {user.role === "mentor" && (
            <Link to="/opportunities/create" className="btn-primary flex items-center space-x-2">
              <Plus size={16} />
              <span>Post Opportunity</span>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="pl-10 input-field"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="input-field"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <select
                className="input-field"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, Country"
                className="input-field"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>
            {user.role === "mentor" && (
              <div className="flex items-end">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out mr-2"
                    checked={filters.myOpportunities}
                    onChange={(e) => handleFilterChange("myOpportunities", e.target.checked)}
                  />
                  My Opportunities
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <div key={opportunity._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                        {opportunity.type}
                      </span>
                      {opportunity.matchScore && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {opportunity.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{opportunity.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        <span>
                          {opportunity.createdBy.firstName} {opportunity.createdBy.lastName}
                        </span>
                      </div>
                      {opportunity.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          <span>{opportunity.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-1" />
                        <span className="capitalize">{opportunity.experienceLevel}</span>
                      </div>
                    </div>

                    {/* Required Skills */}
                    {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.requiredSkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Salary Range */}
                    {opportunity.salaryRange && (
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Salary: </span>
                        {opportunity.salaryRange.currency} {opportunity.salaryRange.min?.toLocaleString()} -{" "}
                        {opportunity.salaryRange.max?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    {user.role === "learner" && (
                      <button
                        onClick={() => handleApply(opportunity._id)}
                        className="btn-primary"
                        disabled={opportunity.applications?.some((app) => app.userId === user.id)}
                      >
                        {opportunity.applications?.some((app) => app.userId === user.id) ? "Applied" : "Apply"}
                      </button>
                    )}
                    {user.role === "mentor" && opportunity.createdBy._id === user.id && (
                      <Link
                        to={`/opportunities/edit/${opportunity._id}`}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <span>Edit</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Opportunities

