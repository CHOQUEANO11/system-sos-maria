import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

import Admins from "./pages/Admins"
import Women from "./pages/Women"
import Emergencies from "./pages/Emergencies"
import EmergencyDetail from "./pages/EmergencyDetail"
import Reports from "./pages/Reports"

import DashboardLayout from "./layouts/DashboardLayout"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* ADMINS */}

        <Route
          path="/admins"
          element={
            <DashboardLayout>
              <Admins />
            </DashboardLayout>
          }
        />

        {/* WOMEN */}

        <Route
          path="/women"
          element={
            <DashboardLayout>
              <Women />
            </DashboardLayout>
          }
        />

        {/* EMERGENCIES */}

        <Route
          path="/emergencies"
          element={
            <DashboardLayout>
              <Emergencies />
            </DashboardLayout>
          }
        />

        {/* EMERGENCY DETAIL */}

        <Route
          path="/emergency/:id"
          element={
            <DashboardLayout>
              <EmergencyDetail />
            </DashboardLayout>
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App