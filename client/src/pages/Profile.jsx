"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import { User, Edit3, Save, X, Link, Users } from "lucide-react" // Import Link from lucide-react for consistency
import SkillRadarChart from "../components/SkillRadarChart"
import LoadingSpinner from "../components/LoadingSpinner"

const Profile = () => {
  const { user, setUser } = useAuth() // Get setUser from AuthContext
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({})
  const [connectionsList, setConnectionsList] = useState([]) // New state for connections

  useEffect(() => {
    fetchProfile()
    fetchConnections() // Fetch connections on mount
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/users/profile")
      setProfile(response.data.user)
      setFormData(response.data.user)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load profile")
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const response = await axios.get("/api/users/connections")
      setConnectionsList(response.data.connections)
    } catch (error) {
      console.error("Failed to load connections:", error)
      toast.error("Failed to load connections")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleArrayInputChange = (e, fieldName) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }))
  }

  const handleSave = async () => {
    try {
      const response = await axios.put("/api/users/profile", formData)
      setProfile(response.data.user)
      setUser(response.data.user) // Update user in AuthContext
      setEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setEditing(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit3 size={16} />
              <span>{editing ? "Cancel" : "Edit Profile"}</span>
            </button>
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
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.firstName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.lastName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.location || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profile?.bio || "No bio provided"}</p>
                )}
              </div>

              {editing && (
                <div className="flex space-x-4 mt-6">
                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                  <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || ""}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.experience || "Not provided"} years</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  {editing ? (
                    <input
                      type="text"
                      name="education"
                      value={formData.education || ""}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Degree, Institution"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.education || "Not provided"}</p>
                  )}
                </div>
              </div>

              {profile?.role === "mentor" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                  {editing ? (
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise?.join(", ") || ""}
                      onChange={(e) => handleArrayInputChange(e, "expertise")}
                      className="input-field"
                      placeholder="JavaScript, React, Node.js (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.expertise?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      )) || <p className="text-gray-900">No expertise listed</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assessment History - Only for Learners */}
            {profile?.role === "learner" && (
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

            {/* Connections List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Connections</h2>
              {connectionsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connectionsList.map((connection) => (
                    <div key={connection._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        {connection.avatar ? (
                          <img
                            src={connection.avatar || "/placeholder.svg"}
                            alt={`${connection.firstName[0]}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">{connection.firstName?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          <Link to={`/profile/${connection._id}`} className="hover:underline">
                            {connection.firstName} {connection.lastName}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{connection.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No connections yet.</p>
                  <p className="text-sm text-gray-500">Connect with mentors or learners on the Discover page.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Skill DNA & Stats */}
          <div className="space-y-6">
            {/* Skill DNA - Only for Learners */}
            {profile?.role === "learner" && profile?.skillDNA && profile.skillDNA.length > 0 ? (
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
              profile?.role === "learner" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Skill DNA</h2>
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Take assessments to build your Skill DNA</p>
                  </div>
                </div>
              )
            )}

            {/* Behavioral Profile */}
            {profile?.behavioralProfile && (
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

export default Profile

