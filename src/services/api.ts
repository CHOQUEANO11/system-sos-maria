import axios from "axios"

export const api = axios.create({
  // baseURL: "http://localhost:3000"
  baseURL: "https://api-sos-maria-2026.onrender.com"
})

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config

})