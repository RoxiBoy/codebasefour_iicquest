"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, MessageCircle, Briefcase, BarChart3, Users, Menu, X, Bell, Search } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "../contexts/axios"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState(0)

  const isActive = (path) => location.pathname === path

  // Reset unread count when user visits chat page
  useEffect(() => {
    if (location.pathname.includes("/chat") && unreadCount > 0) {
      // Small delay to allow chat component to mark messages as read
      setTimeout(() => {
        fetchUnreadCount()
      }, 1000)
    }
  }, [location.pathname])

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/api/chat/unread-count")
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/discover"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/discover")
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Users size={18} />
                  <span>Discover</span>
                </Link>

                <Link
                  to="/opportunities"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname.includes("/opportunities")
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Briefcase size={18} />
                  <span>Opportunities</span>
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    location.pathname.includes("/chat")
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <MessageCircle size={18} />
                  <span>Chat</span>
                  {/* Dynamic notification badge for chat */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </Link>

                {/* User Profile Section */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-100">
                  <Link to="/profile" className="group relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md ${
                        isActive("/profile")
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                          : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-semibold">{user.firstName?.[0]}</span>
                    </div>
                  </Link>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{user.firstName}</p>
                    <p className="text-xs text-blue-600 capitalize font-medium">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 ml-2 rounded-xl text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-xl z-50">
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{user.firstName?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.firstName}</p>
                      <p className="text-sm text-blue-600 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive("/dashboard") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <BarChart3 size={20} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive("/discover") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Users size={20} />
                    <span>Discover</span>
                  </Link>

                  <Link
                    to="/opportunities"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      location.pathname.includes("/opportunities")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Briefcase size={20} />
                    <span>Opportunities</span>
                  </Link>

                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 relative ${
                      location.pathname.includes("/chat")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <MessageCircle size={20} />
                    <span>Chat</span>
                    {/* Dynamic notification badge for mobile */}
                    {unreadCount > 0 && (
                      <div className="min-w-[1.25rem] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 ml-auto animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive("/profile") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{user.firstName?.[0]}</span>
                    </div>
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-blue-50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar
