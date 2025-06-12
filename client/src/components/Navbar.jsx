"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, MessageCircle, Briefcase, BarChart3, Users, Menu, X } from "lucide-react"
import { useState } from "react"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSphere</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/dashboard") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/discover"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/discover") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <Users size={16} />
                  <span>Discover</span>
                </Link>

                <Link
                  to="/opportunities"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname.includes("/opportunities")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Opportunities</span>
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname.includes("/chat")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </Link>

                <div className="relative ml-3">
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                    <Link to="/profile" className="group relative">
                      <div
                        className={`w-8 h-8 ${isActive("/profile") ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"} rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors`}
                      >
                        <span className="text-sm font-medium">{user.firstName?.[0]}</span>
                      </div>
                    </Link>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{user.firstName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 ml-1 rounded-md text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard") ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/discover") ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  Discover
                </Link>
                <Link
                  to="/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname.includes("/opportunities") ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  Opportunities
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname.includes("/chat") ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  Chat
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/profile") ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

