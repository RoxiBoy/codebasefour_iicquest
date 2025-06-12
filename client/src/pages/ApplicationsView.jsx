"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { ArrowLeft, User, Check, XCircle, MessageCircle } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const ApplicationsView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [id])

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`/api/opportunities/${id}/applications`)
      setOpportunity(response.data.opportunity)
      setApplications(response.data.applications)
      setLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load applications")
      navigate("/opportunities")
    }
  }

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await axios.put(`/api/opportunities/${id}/applications/${applicationId}`, { status })
      toast.success(`Application ${status}!`)
      fetchApplications() 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update application status")
    }
  }

  if (loading) return <LoadingSpinner />

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity not found</h2>
          <p className="text-gray-600">The opportunity you're looking for doesn't exist or you don't have access.</p>
          <Link to="/opportunities" className="btn-primary mt-4">
            Browse Opportunities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Applications for "{opportunity.title}"</h1>
          <p className="text-gray-600 mt-2">Review and manage applications for your posted opportunity.</p>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-gray-600">
                        {app.userId.firstName?.[0]}
                        {app.userId.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        <Link to={`/profile/view/${app.userId._id}`} className="hover:underline">
                          {app.userId.firstName} {app.userId.lastName}
                        </Link>
                      </h3>
                      <p className="text-gray-600 capitalize">{app.userId.role}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>

                      {app.matchScore !== undefined && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm mt-2 inline-block">
                          {app.matchScore}% Match
                        </span>
                      )}

                      <p className="text-gray-700 mt-3">
                        <span className="font-medium">Cover Letter:</span> {app.coverLetter || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Actions and Status */}
                  <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : app.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status}
                    </span>
                    {app.status === "pending" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(app._id, "accepted")}
                          className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app._id, "rejected")}
                          className="p-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/chat/${[app.userId._id, opportunity.createdBy].sort().join("-")}`)}
                      className="btn-secondary flex items-center space-x-1 mt-2"
                    >
                      <MessageCircle size={16} />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Share your opportunity to attract more applicants!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationsView

