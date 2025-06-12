"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Assessment from "./pages/Assessment"
import Opportunities from "./pages/Opportunities"
import Chat from "./pages/Chat"
import LoadingSpinner from "./components/LoadingSpinner"
import ProfileView from "./pages/ProfileView"
import OpportunityCreate from "./pages/OpportunityCreate"
import OpportunityEdit from "./pages/OpportunityEdit"
import ApplicationsView from "./pages/ApplicationsView"
import Discover from "./pages/Discover"
import { Toaster } from "react-hot-toast"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/profile/view/:id" element={user ? <ProfileView /> : <Navigate to="/login" replace />} />
            <Route path="/assessment/:type" element={user ? <Assessment /> : <Navigate to="/login" replace />} />
            <Route path="/opportunities" element={user ? <Opportunities /> : <Navigate to="/login" replace />} />
            <Route
              path="/opportunities/create"
              element={user ? <OpportunityCreate /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/opportunities/edit/:id"
              element={user ? <OpportunityEdit /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/opportunities/:id/applications"
              element={user ? <ApplicationsView /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/chat/:roomId?"
              element={
                user ? (
                  <div className="h-screen overflow-hidden">
                    <Chat />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/discover" element={user ? <Discover /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
