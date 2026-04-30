/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts"
import {
  Users,
  ShieldCheck,
  Siren,
  CheckCircle2,
  Printer,
  BarChart3
} from "lucide-react"

import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import DashboardPolice from "./DashboardPolice"

type CardProps = {
  title: string
  value: string | number
  icon: any
  color: string
  bg: string
}

export default function Dashboard() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    women: 0,
    admins: 0,
    emergencies: 0,
    resolved: 0
  })

  const [chart, setChart] = useState<any[]>([])
  const [statusChart, setStatusChart] = useState<any[]>([])
  const [adminsChart, setAdminsChart] = useState<any[]>([])

  const loadDashboard = async () => {
    if (user?.role === "POLICE") return

    try {
      setLoading(true)

      const params: any = {}

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const [womenRes, adminsRes, emergenciesRes] = await Promise.all([
        api.get("/users", {
          params: { role: "WOMAN", ...params }
        }),

        api.get("/users", {
          params: { role: "ADMIN", ...params }
        }),

        api.get("/emergencies", { params })
      ])

      const women = womenRes.data.data || []
      const admins = adminsRes.data.data || []
      const emergencies = emergenciesRes.data.data || []

      const resolved = emergencies.filter((e: any) => e.status === "RESOLVED")

      setStats({
        women: women.length,
        admins: admins.length,
        emergencies: emergencies.length,
        resolved: resolved.length
      })

      const months: any = {}

      emergencies.forEach((e: any) => {
        const date = new Date(e.createdAt)
        const year = date.getFullYear()
        const monthNumber = date.getMonth() + 1
        const key = `${year}-${String(monthNumber).padStart(2, "0")}`

        if (!months[key]) {
          months[key] = {
            name: date.toLocaleString("pt-BR", { month: "short" }),
            casos: 0
          }
        }

        months[key].casos++
      })

      const chartData = Object.keys(months)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => ({
          name: months[key].name,
          casos: months[key].casos
        }))

      setChart(chartData)

      const pending = emergencies.filter((e: any) => e.status === "PENDING").length
      const inProgress = emergencies.filter((e: any) => e.status === "IN_PROGRESS").length
      const resolvedCount = emergencies.filter((e: any) => e.status === "RESOLVED").length

      setStatusChart([
        { name: "Pendentes", value: pending },
        { name: "Em progresso", value: inProgress },
        { name: "Resolvidos", value: resolvedCount }
      ])

      if (user?.role === "SUPER_ADMIN") {
        const municipalities: any = {}

        admins.forEach((a: any) => {
          const m = a.municipality?.name || "Sem município"
          municipalities[m] = (municipalities[m] || 0) + 1
        })

        const adminsData = Object.keys(municipalities).map((m) => ({
          name: m,
          admins: municipalities[m]
        }))

        setAdminsChart(adminsData)
      }
    } catch (error) {
      console.log("Erro ao carregar dashboard", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [user])

  if (user?.role === "POLICE") {
    return <DashboardPolice />
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando dashboard...</p>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Dashboard</h2>
          <p style={styles.subtitle}>
            Visão geral dos cadastros, emergências e atendimentos do SOS MARIA.
          </p>
        </div>

        <button onClick={() => window.print()} style={styles.printBtn}>
          <Printer size={18} />
          Imprimir relatório
        </button>
      </div>

      <div style={styles.cards}>
        <Card
          title="Mulheres cadastradas"
          value={stats.women}
          icon={Users}
          color="#db2777"
          bg="#fdf2f8"
        />

        <Card
          title="Admins"
          value={stats.admins}
          icon={ShieldCheck}
          color="#4f46e5"
          bg="#eef2ff"
        />

        <Card
          title="Pedidos de ajuda"
          value={stats.emergencies}
          icon={Siren}
          color="#dc2626"
          bg="#fef2f2"
        />

        <Card
          title="Chamados atendidos"
          value={stats.resolved}
          icon={CheckCircle2}
          color="#059669"
          bg="#ecfdf5"
        />
      </div>

      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Emergências por mês</h3>
              <p style={styles.chartSubtitle}>Evolução mensal dos pedidos de ajuda.</p>
            </div>

            <div style={styles.chartIcon}>
              <BarChart3 size={20} />
            </div>
          </div>

          {chart.length === 0 ? (
            <EmptyChart text="Nenhuma emergência registrada no período." />
          ) : (
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="casos" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Status das emergências</h3>
              <p style={styles.chartSubtitle}>Distribuição atual dos chamados.</p>
            </div>
          </div>

          {statusChart.every((item) => item.value === 0) ? (
            <EmptyChart text="Nenhum status disponível." />
          ) : (
            <ResponsiveContainer width="100%" height={310}>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  label
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {user?.role === "SUPER_ADMIN" && (
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Admins por município</h3>
              <p style={styles.chartSubtitle}>
                Quantidade de administradores vinculados por município.
              </p>
            </div>
          </div>

          {adminsChart.length === 0 ? (
            <EmptyChart text="Nenhum admin cadastrado." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={adminsChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="admins" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

const Card = ({ title, value, icon: Icon, color, bg }: CardProps) => {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardIcon, background: bg, color }}>
        <Icon size={22} />
      </div>

      <p style={styles.cardTitle}>{title}</p>

      <h2 style={{ ...styles.cardValue, color }}>
        {value}
      </h2>
    </div>
  )
}

function EmptyChart({ text }: any) {
  return (
    <div style={styles.emptyChart}>
      {text}
    </div>
  )
}

const styles: any = {
  container: {
    width: "100%"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap"
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: 28,
    fontWeight: 800
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#111827",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(17,24,39,0.18)"
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
    marginBottom: 24
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)"
  },

  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },

  cardTitle: {
    color: "#6b7280",
    margin: 0,
    fontSize: 14,
    fontWeight: 700
  },

  cardValue: {
    margin: "10px 0 0",
    fontSize: 32,
    fontWeight: 900
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 20
  },

  chartCard: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    marginBottom: 20
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18
  },

  chartTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18,
    fontWeight: 800
  },

  chartSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13
  },

  chartIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#fdf2f8",
    color: "#db2777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  emptyChart: {
    height: 310,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontWeight: 700,
    background: "#f9fafb",
    borderRadius: 12,
    border: "1px dashed #d1d5db"
  },

  loadingContainer: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  },

  spinner: {
    width: 46,
    height: 46,
    border: "5px solid #eee",
    borderTop: "5px solid #ec4899",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },

  loadingText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: 700
  }
}
