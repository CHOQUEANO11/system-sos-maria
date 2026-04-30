import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./index.css"
import "./styles/theme.css"
import App from './App.tsx'
import "leaflet/dist/leaflet.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      <App />
    </AuthProvider>
  </StrictMode>,
)