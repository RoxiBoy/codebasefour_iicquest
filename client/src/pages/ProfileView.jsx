"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { User, ArrowLeft, MessageCircle, UserPlus, UserCheck, Clock } from "lucide-react"
import SkillRadarChart from "../components/SkillRadarChart"
import LoadingSpinner from "../components/LoadingSpinner"

const ProfileView = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(null) // not_connected, pending_sent, pending_received, connected
  const isOwner = currentUser?._id === userId

  useEffect(() => {
    fetchProfile()
  }, [userId, currentUser])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/profile/${userId}`)
      setProfile(response.data.user)
      setConnectionStatus(response.data.connectionStatus)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load profile")
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      const response = await axios.post(`/api/users/connect/${userId}`)
      toast.success(response.data.message)
      setConnectionStatus(response.data.status) // Should be 'pending_sent'
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send connection request")
    }
  }

  const handleAcceptRequest = async () => {
    try {
      // Find the request ID from the current user's received requests
      // This would typically be done by fetching received requests and finding the one from this userId
      // For simplicity, assuming the backend handles it with just the target userId for now,
      // or we'd need to fetch all requests first.
      // A more robust solution would involve fetching received requests and passing the requestId.
      // For now, we'll rely on the backend to find the correct pending request.
      const requestsRes = await axios.get("/api/users/requests/received")
      const requestToAccept = requestsRes.data.requests.find((req) => req.sender._id === userId)

      if (requestToAccept) {
        await axios.post(`/api/users/requests/${requestToAccept._id}/accept`)
        toast.success("Connection request accepted!")
        setConnectionStatus("connected")
      } else {
        toast.error("No pending request found from this user.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    )
  }

  const canViewPrivateInfo = isOwner || connectionStatus === "connected"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/discover" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Discover
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-6">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar || "/placeholder.svg"}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {profile?.firstName?.[0]}
                    {profile?.lastName?.[0]}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-gray-600 capitalize">{profile?.role}</p>
                {profile?.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
              </div>
            </div>
            {!isOwner && (
              <div className="flex space-x-2">
                {connectionStatus === "not_connected" && (
                  <button onClick={handleConnect} className="btn-primary flex items-center space-x-2 px-4 py-2">
                    <UserPlus size={16} />
                    <span>Connect</span>
                  </button>
                )}
                {connectionStatus === "pending_sent" && (
                  <button
                    disabled
                    className="btn-secondary flex items-center space-x-2 px-4 py-2 opacity-70 cursor-not-allowed"
                  >
                    <Clock size={16} />
                    <span>Request Sent</span>
                  </button>
                )}
                {connectionStatus === "pending_received" && (
                  <button
                    onClick={handleAcceptRequest}
                    className="btn-primary flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck size={16} />
                    <span>Accept Request</span>
                  </button>
                )}
                {connectionStatus === "connected" && (
                  <Link
                    to={`/chat/${[currentUser._id, userId].sort().join("-")}`}
                    className="btn-primary flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageCircle size={16} />
                    <span>Message</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-gray-900">{profile?.firstName || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-gray-900">{profile?.lastName || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{profile?.location || "Not provided"}</p>
                </div>
                {canViewPrivateInfo && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{profile?.email || "Not provided"}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-gray-900">{profile.phone}</p>
                      </div>
                    )}
                    {profile?.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <p className="text-gray-900">{profile?.experience || "Not provided"} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <p className="text-gray-900">{profile?.education || "Not provided"}</p>
                </div>
              </div>

              {profile?.role === "mentor" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.expertise?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    )) || <p className="text-gray-900">No expertise listed</p>}
                  </div>
                </div>
              )}

              {canViewPrivateInfo && (
                <>
                  {profile?.workExperience && profile.workExperience.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Work Experience</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.workExperience.map((exp, index) => (
                          <li key={index} className="text-gray-900">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile?.learningGoals && profile.learningGoals.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Learning Goals</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.learningGoals.map((goal, index) => (
                          <li key={index} className="text-gray-900">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile?.achievements && profile.achievements.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Achievements</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.achievements.map((achievement, index) => (
                          <li key={index} className="text-gray-900">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile?.certifications && profile.certifications.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Certifications</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.certifications.map((cert, index) => (
                          <li key={index} className="text-gray-900">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Assessment History - Only for Learners and if canViewPrivateInfo */}
            {profile?.role === "learner" && canViewPrivateInfo && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment History</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Behavioral Assessment</span>
                    <span className="text-sm text-gray-600">
                      {profile?.lastBehavioralAssessment
                        ? new Date(profile.lastBehavioralAssessment).toLocaleDateString()
                        : "Not taken"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Technical Assessment</span>
                    <span className="text-sm text-gray-600">
                      {profile?.lastSkillAssessment
                        ? new Date(profile.lastSkillAssessment).toLocaleDateString()
                        : "Not taken"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Skill DNA & Stats */}
          <div className="space-y-6">
            {/* Skill DNA - Only for Learners and if canViewPrivateInfo */}
            {profile?.role === "learner" && canViewPrivateInfo && profile?.skillDNA && profile.skillDNA.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skill DNA</h2>
                <>
                  <SkillRadarChart skills={profile.skillDNA} />
                  <div className="mt-4 space-y-2">
                    {profile.skillDNA.slice(0, 5).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.skillName}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${skill.level}%` }} />
                          </div>
                          <span className="text-sm text-gray-600">{skill.level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              </div>
            ) : (
              profile?.role === "learner" &&
              canViewPrivateInfo && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Skill DNA</h2>
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Take assessments to build your Skill DNA</p>
                  </div>
                </div>
              )
            )}

            {/* Behavioral Profile - Only if canViewPrivateInfo */}
            {canViewPrivateInfo && profile?.behavioralProfile && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Behavioral Profile</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Communication Style:</span>
                    <p className="text-gray-900">{profile.behavioralProfile.communicationStyle || "Not assessed"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Working Style:</span>
                    <p className="text-gray-900">{profile.behavioralProfile.workingStyle || "Not assessed"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Leadership Tendency:</span>
                    <p className="text-gray-900">
                      {profile.behavioralProfile.leadershipTendency
                        ? `${profile.behavioralProfile.leadershipTendency}/10`
                        : "Not assessed"}
                    </p>
                  </div>
                  {profile?.behavioralProfile?.preferredLearningStyle && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Preferred Learning Style:</span>
                      <p className="text-gray-900">{profile.behavioralProfile.preferredLearningStyle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-bold text-gray-900">{profile?.connections?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Assessment Streak</span>
                  <span className="font-bold text-gray-900">{profile?.assessmentStreak || 0} days</span>
                </div>
                {profile?.role === "mentor" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Mentees</span>
                      <span className="font-bold text-gray-900">{profile?.totalMentees || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-bold text-gray-900">
                        {profile?.mentorRating ? `${profile.mentorRating}/5` : "No ratings"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView

