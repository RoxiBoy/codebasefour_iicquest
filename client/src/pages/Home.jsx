"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Brain, Users, Target, TrendingUp } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSphere
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The Adaptive Talent Ecosystem that continuously evolves with your learning patterns, collaboration style,
            and growing skill set. Connect with the right people and unlock the right opportunities.
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-lg text-gray-600">Discover how SkillSphere transforms learning and talent matching</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Mapping</h3>
            <p className="text-gray-600">
              Daily micro-challenges assess real-world competencies and update your evolving "Skill DNA."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              Behavioral compatibility engine identifies who you work best with for smarter mentor and team matching.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Opportunity Radar</h3>
            <p className="text-gray-600">
              Dynamic recommendations for jobs, internships, and learning paths based on your growth and compatibility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Adaptive Learning</h3>
            <p className="text-gray-600">
              AI-powered insights help you grow the right skills and connect with the right opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Learning Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners and mentors who are already growing their skills and building meaningful
            connections.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
            >
              Start Your Journey
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
