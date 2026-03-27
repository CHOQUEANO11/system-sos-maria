import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

import Admins from "./pages/Admins"
import Women from "./pages/Women"
import Emergencies from "./pages/Emergencies"
import EmergencyDetail from "./pages/EmergencyDetail"
import Reports from "./pages/Reports"
import Municipalities from "./pages/Municipality"
import VisitRequests from "./pages/VisitRequests"

// 🔥 NOVAS PAGES
import Efetivo from "./pages/Efetivo"
import CreateAgenda from "./pages/CreateAgenda"

import DashboardLayout from "./layouts/DashboardLayout"
import PrivateRoute from "./components/PrivateRoute"
import Unidades from "./pages/Unit"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            LOGIN
        ========================= */}

        <Route path="/" element={<Login />} />

        {/* =========================
            DASHBOARD
        ========================= */}

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

        {/* =========================
            ADMINS
        ========================= */}

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

        {/* =========================
            MULHERES
        ========================= */}

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

        {/* =========================
            EFETIVO (NOVO)
        ========================= */}

        <Route
          path="/efetivo"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Efetivo />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* =========================
            AGENDA (NOVO)
        ========================= */}

        <Route
          path="/agenda-create"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CreateAgenda />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* =========================
            EMERGÊNCIAS
        ========================= */}

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

        {/* =========================
            VISITAS
        ========================= */}

        <Route
          path="/visitRequest"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <VisitRequests />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* =========================
            RELATÓRIOS
        ========================= */}

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

        {/* =========================
            MUNICÍPIOS
        ========================= */}

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

        <Route
          path="/units"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Unidades />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App