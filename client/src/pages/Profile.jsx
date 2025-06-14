"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import {
  User,
  Edit3,
  Save,
  X,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Star,
  TrendingUp,
  Brain,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  Code,
  Plus,
  Trash2,
} from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import BehavioralSpiderGraph from "../components/BehavioralSpiderGraph"

const Profile = () => {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({})
  const [connectionsList, setConnectionsList] = useState([])
  const [behavioralData, setBehavioralData] = useState([])
  const [skillData, setSkillData] = useState([])
  const [newSkill, setNewSkill] = useState({ name: "", level: 50, category: "" })
  const [skillCategories] = useState([
    "Programming",
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Design",
    "Management",
    "Communication",
    "Other",
  ])
  const [behavioralLoading, setBehavioralLoading] = useState(true)
  const [skillLoading, setSkillLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchConnections()
    fetchAssessmentData()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/users/profile")
      setProfile(response.data.user)
      setFormData(response.data.user)

      // Initialize skills array if it doesn't exist
      if (!response.data.user.skills) {
        setFormData((prev) => ({
          ...prev,
          skills: [],
        }))
      }

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

const fetchAssessmentData = async () => {
  try {
    setBehavioralLoading(true)
    
    // Fetch the latest behavioral assessment data
    const behavioralResponse = await axios.get("http://localhost:5000/api/assessments/assesment/behavioral")
    if (behavioralResponse.data.assessment && behavioralResponse.data.assessment.skillsAssessed) {
      const behavioralSkills = behavioralResponse.data.assessment.skillsAssessed.map((skill) => ({
        skillName: skill.skillName,
        score: skill.score,
        confidence: skill.confidence,
      }))
      setBehavioralData(behavioralSkills)
    } else {
      setBehavioralData([])
    }
    
    // Fetch the latest technical assessment data
    const skillResponse = await axios.get("http://localhost:5000/api/assessments/assesment/technical")
    if (skillResponse.data.assessment && skillResponse.data.assessment.skillsAssessed) {
      const technicalSkills = skillResponse.data.assessment.skillsAssessed.map((skill) => ({
        skillName: skill.skillName,
        score: skill.score,
        confidence: skill.confidence,
      }))
      setSkillData(technicalSkills) // Fixed: was setting behavioralData instead of skillData
    } else {
      setSkillData([]) // Fixed: was setting behavioralData instead of skillData
    }
    
  } catch (error) {
    console.error("Failed to load assessment data:", error)
    setBehavioralData([])
    setSkillData([]) // Added this line
    toast.error("Failed to load assessment data")
  } finally {
    setBehavioralLoading(false)
    setSkillLoading(false)
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

  const handleNewSkillChange = (e) => {
    const { name, value } = e.target
    setNewSkill((prev) => ({
      ...prev,
      [name]: name === "level" ? Number.parseInt(value) : value,
    }))
  }

  const addSkill = () => {
    if (!newSkill.name || !newSkill.category) {
      toast.error("Skill name and category are required")
      return
    }

    setFormData((prev) => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        {
          id: Date.now().toString(), // Temporary ID for frontend use
          name: newSkill.name,
          level: newSkill.level,
          category: newSkill.category,
        },
      ],
    }))

    // Reset the new skill form
    setNewSkill({ name: "", level: 50, category: "" })
  }

  const removeSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== skillId),
    }))
  }

  const handleSkillLevelChange = (skillId, newLevel) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === skillId ? { ...skill, level: Number.parseInt(newLevel) } : skill,
      ),
    }))
  }

  const handleSave = async () => {
    try {
      const response = await axios.put("/api/users/profile", formData)
      setProfile(response.data.user)
      setUser(response.data.user)
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

  const handleRefreshAssessment = () => {
    fetchAssessmentData()
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

  const getSkillLevelLabel = (level) => {
    if (level < 30) return "Beginner"
    if (level < 60) return "Intermediate"
    if (level < 85) return "Advanced"
    return "Expert"
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar || "/placeholder.svg"}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile?.firstName?.[0]}
                      {profile?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 capitalize font-medium">{profile?.role}</p>
                  {profile?.bio && <p className="text-gray-600 mt-2 max-w-md">{profile.bio}</p>}
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                >
                  <Edit3 size={18} />
                  <span>{editing ? "Cancel" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.firstName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.lastName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium">
                      <MapPin size={16} className="mr-2 text-blue-500" />
                      {profile?.location || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.bio || "No bio provided"}</p>
                )}
              </div>

              {editing && (
                <div className="flex space-x-4 mt-6 pt-6 border-t border-blue-100">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Skills Section - NEW */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
              </div>

              {editing ? (
                <div className="space-y-6">
                  {/* Current Skills */}
                  {formData.skills && formData.skills.length > 0 ? (
                    <div className="space-y-4">
                      {formData.skills.map((skill) => (
                        <div key={skill.id} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{skill.name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {skill.category}
                              </span>
                            </div>
                            <button
                              onClick={() => removeSkill(skill.id)}
                              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Remove skill"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => handleSkillLevelChange(skill.id, e.target.value)}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                              {getSkillLevelLabel(skill.level)} ({skill.level}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 italic mb-4">No skills added yet. Add your first skill below.</p>
                  )}

                  {/* Add New Skill Form */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Skill</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newSkill.name}
                          onChange={handleNewSkillChange}
                          placeholder="e.g., JavaScript, Python, UI Design"
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          name="category"
                          value={newSkill.category}
                          onChange={handleNewSkillChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                        >
                          <option value="">Select a category</option>
                          {skillCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proficiency Level: {getSkillLevelLabel(newSkill.level)} ({newSkill.level}%)
                      </label>
                      <input
                        type="range"
                        name="level"
                        min="0"
                        max="100"
                        value={newSkill.level}
                        onChange={handleNewSkillChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Skill</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {skill.category}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{getSkillLevelLabel(skill.level)}</span>
                              <span className="font-medium">{skill.level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full"
                                style={{ width: `${skill.level}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Code className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-2">No skills have been added yet.</p>
                      <p className="text-sm text-gray-500">Click "Edit Profile" to add your skills.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Professional Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      min="0"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium">
                      <Clock size={16} className="mr-2 text-purple-500" />
                      {profile?.experience || "Not provided"} years
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  {editing ? (
                    <input
                      type="text"
                      name="education"
                      value={formData.education || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Degree, Institution"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 font-medium">
                      <GraduationCap size={16} className="mr-2 text-purple-500" />
                      {profile?.education || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {profile?.role === "mentor" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
                  {editing ? (
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise?.join(", ") || ""}
                      onChange={(e) => handleArrayInputChange(e, "expertise")}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="JavaScript, React, Node.js (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.expertise?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )) || <p className="text-gray-900 font-medium">No expertise listed</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Behavioral Assessment Graph - Now using Spider Graph */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Behavioral Assessment</h2>
              </div>

              {behavioralLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <LoadingSpinner />
                </div>
              ) : behavioralData.length > 0 ? (
                <div>
                  {/* Spider Graph Component */}
                  <BehavioralSpiderGraph
                    behavioralData={behavioralData}
                    onRefresh={handleRefreshAssessment}
                    isLoading={behavioralLoading}
                  />

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                    <p className="text-sm text-green-700 font-medium">
                      Last assessment:{" "}
                      {profile?.lastBehavioralAssessment
                        ? new Date(profile.lastBehavioralAssessment).toLocaleDateString()
                        : "Recently completed"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Behavioral Assessment Data</h3>
                  <p className="text-gray-600 mb-6">Take a behavioral assessment to see your personality insights</p>
                  <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg">
                    Take Assessment
                  </button>
                </div>
              )}
            </div>

    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
  <div className="flex items-center space-x-3 mb-6">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Target className="w-5 h-5 text-blue-600" />
    </div>
    <h2 className="text-xl font-semibold text-gray-900">Technical Skills Assessment</h2>
  </div>
  {skillLoading ? (
    <div className="flex items-center justify-center h-[300px]">
      <LoadingSpinner />
    </div>
  ) : skillData.length > 0 ? (
    <div>
      {/* Technical Skills Graph Component */}
      <BehavioralSpiderGraph
        behavioralData={skillData}
        onRefresh={handleRefreshAssessment}
        isLoading={skillLoading}
      />
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          Last assessment:{" "}
          {profile?.lastTechnicalAssessment
            ? new Date(profile.lastTechnicalAssessment).toLocaleDateString()
            : "Recently completed"}
        </p>
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Technical Skills Data</h3>
      <p className="text-gray-600 mb-6">Take a technical assessment to evaluate your skills</p>
      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg">
        Take Assessment
      </button>
    </div>
  )}
</div>
                      {/* Connections List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your Connections</h2>
              </div>

              {connectionsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connectionsList.map((connection, index) => (
                    <div
                      key={connection._id}
                      className="flex items-center p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getRandomGradient(index)} rounded-xl flex items-center justify-center mr-4 shadow-lg`}
                      >
                        {connection.avatar ? (
                          <img
                            src={connection.avatar || "/placeholder.svg"}
                            alt={`${connection.firstName[0]}`}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">{connection.firstName?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group">
                          <button className="hover:text-blue-600 transition-colors flex items-center">
                            {connection.firstName} {connection.lastName}
                            <ArrowUpRight
                              size={14}
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </button>
                        </p>
                        <p className="text-sm text-gray-600 capitalize font-medium">{connection.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                  <p className="text-gray-600 mb-6">Connect with mentors or learners on the Discover page</p>
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg">
                    Find Connections
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center">
                    <Users size={20} className="text-blue-600 mr-3" />
                    <span className="text-gray-700 font-medium">Connections</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{connectionsList?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <div className="flex items-center">
                    <Calendar size={20} className="text-green-600 mr-3" />
                    <span className="text-gray-700 font-medium">Assessment Streak</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{profile?.assessmentStreak || 0} days</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center">
                    <Code size={20} className="text-purple-600 mr-3" />
                    <span className="text-gray-700 font-medium">Skills Added</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{profile?.skills?.length || 0}</span>
                </div>

                {profile?.role === "mentor" && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center">
                        <Users size={20} className="text-purple-600 mr-3" />
                        <span className="text-gray-700 font-medium">Total Mentees</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{profile?.totalMentees || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                      <div className="flex items-center">
                        <Star size={20} className="text-yellow-600 mr-3" />
                        <span className="text-gray-700 font-medium">Rating</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">
                        {profile?.mentorRating ? `${profile.mentorRating}/5` : "No ratings"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Latest</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Profile Champion</h3>
              <p className="text-sm opacity-90 mb-4">Completed your profile with all essential information</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
              </div>
              <p className="text-xs mt-2 opacity-75">Keep updating your profile to unlock more achievements!</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleRefreshAssessment}
                  className="group w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mr-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Refresh Assessment</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button className="group w-full flex items-center justify-between p-4 rounded-xl hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors mr-3">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Find Connections</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                <button className="group w-full flex items-center justify-between p-4 rounded-xl hover:bg-purple-50 transition-all duration-200 border border-transparent hover:border-purple-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors mr-3">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-900 font-medium">Browse Opportunities</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

