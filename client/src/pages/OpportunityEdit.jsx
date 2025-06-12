"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "../contexts/axios"
import toast from "react-hot-toast"
import LoadingSpinner from "../components/LoadingSpinner"

const OpportunityEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    location: "",
    experienceLevel: "",
    isRemote: false,
    salaryRange: {
      min: "",
      max: "",
      currency: "",
    },
    requiredSkills: "", // comma separated string
    deadline: "",
    status: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchOpportunity()
  }, [id])

  const fetchOpportunity = async () => {
    try {
      const response = await axios.get(`/api/opportunities/${id}`)
      const opp = response.data.opportunity
      setFormData({
        title: opp.title,
        description: opp.description,
        type: opp.type,
        location: opp.location || "",
        experienceLevel: opp.experienceLevel,
        isRemote: opp.isRemote || false,
        salaryRange: {
          min: opp.salaryRange?.min || "",
          max: opp.salaryRange?.max || "",
          currency: opp.salaryRange?.currency || "USD",
        },
        requiredSkills: opp.requiredSkills?.map((s) => s.skillName).join(", ") || "",
        deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "",
        status: opp.status,
      })
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load opportunity")
      navigate("/opportunities")
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith("salaryRange.")) {
      const salaryField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [salaryField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        requiredSkills: formData.requiredSkills
          .split(",")
          .map((skill) => ({
            skillName: skill.trim(),
            minimumLevel: 50, // Default minimum level
            weight: 1, // Default weight
          }))
          .filter((skill) => skill.skillName), // Remove empty strings
        salaryRange: {
          min: Number.parseInt(formData.salaryRange.min) || 0,
          max: Number.parseInt(formData.salaryRange.max) || 0,
          currency: formData.salaryRange.currency,
        },
      }

      await axios.put(`/api/opportunities/${id}`, submitData)
      toast.success("Opportunity updated successfully!")
      navigate("/opportunities")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update opportunity")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Opportunity</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="job">Job</option>
                  <option value="internship">Internship</option>
                  <option value="project">Project</option>
                  <option value="mentorship">Mentorship</option>
                </select>
              </div>
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="expert">Expert Level</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., New York, USA"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRemote"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleInputChange}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-900">
                This is a remote opportunity
              </label>
            </div>

            <div>
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills (comma separated)
              </label>
              <input
                type="text"
                id="requiredSkills"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <input
                  type="number"
                  id="minSalary"
                  name="salaryRange.min"
                  value={formData.salaryRange.min}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <input
                  type="number"
                  id="maxSalary"
                  name="salaryRange.max"
                  value={formData.salaryRange.max}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button type="button" onClick={() => navigate("/opportunities")} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Updating..." : "Update Opportunity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OpportunityEdit

