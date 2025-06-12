import axios from "axios"

const instance = axios.create({
  baseURL: "http://localhost:5000/", // Your backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add the token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling (e.g., token expiration)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("token")
      window.location.href = "/login" // Redirect to login page
    }
    return Promise.reject(error)
  },
)

export default instance

