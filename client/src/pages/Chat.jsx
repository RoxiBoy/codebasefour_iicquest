"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { Send, Users, MessageCircle, Menu, X, Search, Phone, Video, MoreVertical } from "lucide-react"

const Chat = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [chatRooms, setChatRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(roomId || null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5000")
    setSocket(newSocket)

    fetchChatRooms()

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      newSocket.close()
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (messageData) => {
        if (messageData.roomId === selectedRoom) {
          setMessages((prev) => [...prev, messageData])
        } else {
          setChatRooms((prevRooms) =>
            prevRooms.map((room) =>
              room._id === messageData.roomId ? { ...room, unreadCount: (room.unreadCount || 0) + 1 } : room,
            ),
          )
        }
      })

      return () => socket.off("receive-message")
    }
  }, [socket, selectedRoom])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom)
      if (socket) {
        socket.emit("join-room", selectedRoom)
      }

      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
  }, [selectedRoom, socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get("/api/chat/rooms/list")
      setChatRooms(response.data.rooms)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/api/chat/${roomId}`)
      setMessages(response.data.messages)

      await axios.put(`/api/chat/${roomId}/read`)
      setChatRooms((prevRooms) => prevRooms.map((room) => (room._id === roomId ? { ...room, unreadCount: 0 } : room)))
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom) return

    const currentRoom = chatRooms.find((room) => room._id === selectedRoom)
    const receiverId = currentRoom?.otherUser?._id

    if (!receiverId) {
      toast.error("Could not determine receiver for this chat.")
      return
    }

    try {
      const messageData = {
        roomId: selectedRoom,
        receiverId: receiverId,
        message: newMessage,
      }

      const response = await axios.post("/api/chat/send", messageData)
      const savedMessage = response.data.message

      setMessages((prev) => [...prev, savedMessage])
      setNewMessage("")

      if (socket) {
        socket.emit("send-message", {
          roomId: selectedRoom,
          senderId: user.id,
          receiverId: receiverId,
          message: newMessage,
          timestamp: new Date(),
          senderName: `${user.firstName} ${user.lastName}`,
        })
      }
    } catch (error) {
      console.error("Send message error:", error)
      toast.error("Failed to send message")
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room._id)
  }

  const getChatPartnerName = (room) => {
    return room.otherUser ? `${room.otherUser.firstName} ${room.otherUser.lastName}` : "Unknown User"
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex">
      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-20 left-4 z-20 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-10 w-80 md:w-80 lg:w-96 h-full bg-white/95 backdrop-blur-sm border-r border-blue-100 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length > 0 ? (
            <div className="p-2">
              {chatRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => handleRoomSelect(room)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 mb-2 ${
                    selectedRoom === room._id ? "bg-blue-100 border-blue-200 border shadow-sm" : "hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                        {room.otherUser?.avatar ? (
                          <img
                            src={room.otherUser.avatar || "/placeholder.svg"}
                            alt={`${room.otherUser.firstName[0]}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{room.otherUser?.firstName?.[0]}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">{getChatPartnerName(room)}</p>
                        {room.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {room.lastMessage?.message || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">No connections yet</p>
                <p className="text-sm text-gray-500 mt-1">Connect with mentors or learners to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {chatRooms.find((room) => room._id === selectedRoom)?.otherUser?.firstName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getChatPartnerName(chatRooms.find((room) => room._id === selectedRoom))}
                    </h3>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const isSentByUser = (message.senderId?._id || message.senderId) === user._id

                  return (
                    <div key={index} className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
                        {!isSentByUser && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {chatRooms.find((room) => room._id === selectedRoom)?.otherUser?.firstName?.[0]}
                          </div>
                        )}

                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isSentByUser
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 rounded-bl-md border border-blue-100"
                          }`}
                        >
                          <p className="whitespace-pre-line">{message.message}</p>
                          <p className={`text-xs mt-1 ${isSentByUser ? "text-blue-100" : "text-gray-500"}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-full text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600 mb-6">Choose a connection from the sidebar to start chatting</p>

              <button
                onClick={toggleSidebar}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg md:hidden inline-flex items-center hover:bg-blue-700 transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Show conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-5" onClick={toggleSidebar} />
      )}
    </div>
  )
}

export default Chat
