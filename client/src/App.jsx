"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Login from "./components/Auth/Login"
import Signup from "./components/Auth/Signup"
import Dashboard from "./components/Dashboard/Dashboard"
import BehaviorAssessment from "./components/Assessment/BehaviourAssessment"
import SkillAssessment from "./components/Assessment/SkillAssessment"
import Navbar from "./components/Layout/Navbar"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment/behavior"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <BehaviorAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment/skills"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <SkillAssessment />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
