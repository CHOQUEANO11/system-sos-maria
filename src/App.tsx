import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

import Admins from "./pages/Admins"
import Women from "./pages/Women"
import Emergencies from "./pages/Emergencies"
import EmergencyDetail from "./pages/EmergencyDetail"
import Reports from "./pages/Reports"
import Municipalities from "./pages/Municipality"

import DashboardLayout from "./layouts/DashboardLayout"
import PrivateRoute from "./components/PrivateRoute"

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
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* ADMINS */}

        <Route
          path="/admins"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Admins />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* WOMEN */}

        <Route
          path="/women"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Women />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* EMERGENCIES */}

        <Route
          path="/emergencies"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Emergencies />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* EMERGENCY DETAIL */}

        <Route
          path="/emergency/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <EmergencyDetail />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/municipalities"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Municipalities />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App