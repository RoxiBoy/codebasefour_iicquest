"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "../contexts/axios"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { Send, Users, MessageCircle } from "lucide-react"

const Chat = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [chatRooms, setChatRooms] = useState([]) // Renamed from connections to chatRooms for clarity
  const [selectedRoom, setSelectedRoom] = useState(roomId || null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  
  console.log(user)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5000")
    setSocket(newSocket)

    fetchChatRooms() // Fetch connections that can be chat rooms

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (messageData) => {
        // Ensure message is for the currently selected room
        if (messageData.roomId === selectedRoom) {
          setMessages((prev) => [...prev, messageData])
        } else {
          // Update unread count for other rooms
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
      // This endpoint now returns connections with last message and unread count
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

      // Mark messages as read
      await axios.put(`/api/chat/${roomId}/read`)
      // Reset unread count for the selected room in the sidebar
      setChatRooms((prevRooms) => prevRooms.map((room) => (room._id === roomId ? { ...room, unreadCount: 0 } : room)))
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom) return

    const currentRoom = chatRooms.find((room) => room._id === selectedRoom)
    const receiverId = currentRoom?.otherUser?._id // Get receiver ID from the selected room's otherUser

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

      // Add message to local state immediately
      setMessages((prev) => [...prev, savedMessage])
      setNewMessage("")

      // Emit to socket for real-time delivery to other user
      if (socket) {
        socket.emit("send-message", {
          roomId: selectedRoom,
          senderId: user.id, // Send just the ID for socket
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Your Connections</h2>
              </div>

              {/* Connections List (now acting as chat rooms list) */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  {chatRooms.length > 0 ? (
                    <div className="space-y-2">
                      {chatRooms.map((room) => (
                        <button
                          key={room._id}
                          onClick={() => handleRoomSelect(room)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedRoom === room._id ? "bg-blue-100" : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                {room.otherUser?.avatar ? (
                                  <img
                                    src={room.otherUser.avatar || "/placeholder.svg"}
                                    alt={`${room.otherUser.firstName[0]}`}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">{room.otherUser?.firstName?.[0]}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getChatPartnerName(room)}</p>
                                <p className="text-sm text-gray-600 truncate">
                                  {room.lastMessage?.message || "No messages yet"}
                                </p>
                              </div>
                            </div>
                            {room.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No connections yet</p>
                      <p className="text-sm text-gray-500">Connect with mentors or learners to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getChatPartnerName(chatRooms.find((room) => room._id === selectedRoom))}
                    </h3>
                  </div>

                  {/* Messages */}
  
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isSentByUser = (message.senderId?._id || message.senderId) === user._id;
                    console.log(message)

                      return (
                        <div
        key={index}
        className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-md ${
            isSentByUser
              ? "bg-green-500 text-white rounded-br-none"
              : "bg-white text-gray-900 rounded-bl-none border border-gray-300"
          }`}
        >
          <p className="whitespace-pre-line">{message.message}</p>
          <p
            className={`text-xs mt-1 ${
              isSentByUser ? "text-green-100" : "text-gray-500"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>
                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 input-field"
                      />
                      <button type="submit" className="btn-primary flex items-center space-x-2">
                        <Send size={16} />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a connection from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat

