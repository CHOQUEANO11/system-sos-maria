/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  Users,
  ShieldCheck,
  Siren,
  CheckCircle2,
  Printer,
  BarChart3,
  MapPinned
} from "lucide-react"

import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import DashboardPolice from "./DashboardPolice"
import "leaflet/dist/leaflet.css"

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
  const [emergenciesByMunicipality, setEmergenciesByMunicipality] = useState<any[]>([])
  const [visitsByMunicipality, setVisitsByMunicipality] = useState<any[]>([])
  const [emergencyHeatMap, setEmergencyHeatMap] = useState<any[]>([])

  const loadDashboard = async () => {
    if (user?.role === "POLICE") return

    try {
      setLoading(true)

      const params: any = {
        limit: 9999
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const [womenRes, adminsRes, emergenciesRes, appointmentsRes] = await Promise.all([
        api.get("/users", {
          params: { role: "WOMAN", ...params, all: true }
        }),

        api.get("/users", {
          params: { role: "ADMIN", ...params, all: true }
        }),

        api.get("/emergencies", { params }),

        api.get("/appointment/atendimentos", { params })
      ])

      const women = womenRes.data.data || []
      const admins = adminsRes.data.data || []
      const emergencies = emergenciesRes.data.data || []
      const appointmentsRaw = appointmentsRes.data?.data || appointmentsRes.data || []
      const appointments =
        user?.role === "SUPER_ADMIN"
          ? appointmentsRaw
          : appointmentsRaw.filter((a: any) => {
              const municipalityIds = [
                a.municipalityId,
                a.municipality?.id,
                a.agenda?.municipalityId,
                a.agenda?.municipality?.id
              ].filter(Boolean)

              if (municipalityIds.length === 0) return true

              return municipalityIds.includes(user?.municipalityId)
            })

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

      const municipalityCases: any = {}

      emergencies.forEach((e: any) => {
        const municipalityName =
          e.municipality?.name ||
          e.user?.municipality?.name ||
          "Sem município"

        municipalityCases[municipalityName] = (municipalityCases[municipalityName] || 0) + 1
      })

      const municipalityCasesData = Object.keys(municipalityCases)
        .map((name) => ({
          name,
          pedidos: municipalityCases[name]
        }))
        .sort((a, b) => b.pedidos - a.pedidos)

      setEmergenciesByMunicipality(municipalityCasesData)
      setEmergencyHeatMap(buildEmergencyHeatMap(emergencies))

      const municipalityVisits: any = {}

      appointments.forEach((a: any) => {
        const municipalityName =
          a.agenda?.municipality?.name ||
          a.municipality?.name ||
          "Sem município"

        municipalityVisits[municipalityName] = (municipalityVisits[municipalityName] || 0) + 1
      })

      const municipalityVisitsData = Object.keys(municipalityVisits)
        .map((name) => ({
          name,
          visitas: municipalityVisits[name]
        }))
        .sort((a, b) => b.visitas - a.visitas)

      setVisitsByMunicipality(municipalityVisitsData)

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

  function generateDashboardPdf() {
    const doc = new jsPDF()

    const title = "Relatório do Dashboard"
    const generatedAt = new Date().toLocaleString("pt-BR")

    doc.setFontSize(16)
    doc.text(title, 14, 18)
    doc.setFontSize(10)
    doc.text("SOS MARIA", 14, 25)
    doc.text(`Gerado em: ${generatedAt}`, 14, 31)

    autoTable(doc, {
      startY: 40,
      head: [["Indicador", "Total"]],
      body: [
        ["Mulheres cadastradas", stats.women],
        ["Admins", stats.admins],
        ["Pedidos de ajuda", stats.emergencies],
        ["Chamados atendidos", stats.resolved]
      ],
      ...pdfTableTheme()
    })

    addPdfTable(doc, "Emergências por mês", ["Mês", "Pedidos"], chart.map((item) => [
      item.name,
      item.casos
    ]))

    addPdfTable(doc, "Status das emergências", ["Status", "Total"], statusChart.map((item) => [
      item.name,
      item.value
    ]))

    addPdfTable(doc, "Pedidos de ajuda por município", ["Município", "Pedidos"], emergenciesByMunicipality.map((item) => [
      item.name,
      item.pedidos
    ]))

    addPdfTable(doc, "Visitas realizadas por município", ["Município", "Visitas"], visitsByMunicipality.map((item) => [
      item.name,
      item.visitas
    ]))

    addPdfTable(
      doc,
      "Mapa de calor dos pedidos de ajuda",
      ["Município", "Latitude", "Longitude", "Total", "Pendentes", "Em progresso", "Atendidos", "Assistidas"],
      emergencyHeatMap.map((point) => [
        point.municipality,
        point.latitude,
        point.longitude,
        point.total,
        point.pending,
        point.inProgress,
        point.resolved,
        point.women.join(", ")
      ])
    )

    if (user?.role === "SUPER_ADMIN") {
      addPdfTable(doc, "Admins por município", ["Município", "Admins"], adminsChart.map((item) => [
        item.name,
        item.admins
      ]))
    }

    const blob = doc.output("blob")
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  function pdfTableTheme() {
    return {
      theme: "grid" as const,
      headStyles: {
        fillColor: [99, 102, 241] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: "bold" as const
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: "linebreak" as const
      },
      margin: { left: 14, right: 14 }
    }
  }

  function addPdfTable(doc: jsPDF, title: string, head: string[], body: any[][]) {
    const lastY = (doc as any).lastAutoTable?.finalY || 40
    let startY = lastY + 14

    if (startY > 260) {
      doc.addPage()
      startY = 18
    }

    doc.setFontSize(12)
    doc.text(title, 14, startY)

    autoTable(doc, {
      startY: startY + 5,
      head: [head],
      body: body.length ? body : [["Nenhum dado encontrado", ...head.slice(1).map(() => "-")]],
      ...pdfTableTheme()
    })
  }

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

        <button onClick={generateDashboardPdf} style={styles.printBtn}>
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
            <SimpleBarChart data={chart} valueKey="casos" labelKey="name" color="#ec4899" />
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
            <StatusDonutChart
              data={statusChart}
              colors={["#ef4444", "#f59e0b", "#10b981"]}
            />
          )}
        </div>
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>Mapa de calor dos pedidos de ajuda</h3>
            <p style={styles.chartSubtitle}>
              Concentração geográfica dos acionamentos com localização registrada.
            </p>
          </div>

          <div style={styles.heatMapIcon}>
            <MapPinned size={20} />
          </div>
        </div>

        {emergencyHeatMap.length === 0 ? (
          <EmptyChart text="Nenhum pedido de ajuda com localização registrada." />
        ) : (
          <div style={styles.heatMap}>
            <MapContainer
              center={getHeatMapCenter(emergencyHeatMap)}
              zoom={getHeatMapZoom(emergencyHeatMap)}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {emergencyHeatMap.map((point) => (
                <CircleMarker
                  key={`${point.latitude}-${point.longitude}`}
                  center={[point.latitude, point.longitude]}
                  radius={getHeatRadius(point.total)}
                  pathOptions={{
                    color: getHeatColor(point.total),
                    fillColor: getHeatColor(point.total),
                    fillOpacity: 0.42,
                    opacity: 0.72,
                    weight: 2
                  }}
                >
                  <Popup>
                    <strong>{point.total} pedido(s) de ajuda</strong>
                    <br />
                    {point.municipality}
                    <br />
                    Pendentes: {point.pending} • Em progresso: {point.inProgress} • Atendidos: {point.resolved}
                    <div style={styles.popupWomen}>
                      <strong>Assistidas:</strong>
                      {point.women.map((name: string, index: number) => (
                        <span key={`${point.latitude}-${point.longitude}-${name}-${index}`}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>Pedidos de ajuda por município</h3>
            <p style={styles.chartSubtitle}>
              Ranking dos municípios com maior volume de acionamentos.
            </p>
          </div>

          <div style={styles.mapIcon}>
            <MapPinned size={20} />
          </div>
        </div>

        {emergenciesByMunicipality.length === 0 ? (
          <EmptyChart text="Nenhum pedido de ajuda por município." />
        ) : (
          <SimpleBarChart
            data={emergenciesByMunicipality}
            valueKey="pedidos"
            labelKey="name"
            color="#dc2626"
            height={340}
          />
        )}
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>Visitas realizadas por município</h3>
            <p style={styles.chartSubtitle}>
              Total de atendimentos registrados em cada município.
            </p>
          </div>

          <div style={styles.visitsIcon}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {visitsByMunicipality.length === 0 ? (
          <EmptyChart text="Nenhuma visita realizada por município." />
        ) : (
          <HorizontalBarChart
            data={visitsByMunicipality}
            valueKey="visitas"
            labelKey="name"
            color="#059669"
          />
        )}
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
            <SimpleBarChart data={adminsChart} valueKey="admins" labelKey="name" color="#6366f1" />
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
  return <div style={styles.emptyChart}>{text}</div>
}

function SimpleBarChart({ data, valueKey, labelKey, color, height = 310 }: any) {
  const max = Math.max(...data.map((item: any) => Number(item[valueKey]) || 0), 1)

  return (
    <div style={{ ...styles.simpleBarChart, height }}>
      <div style={styles.simpleBarPlot}>
        {data.map((item: any) => {
          const value = Number(item[valueKey]) || 0
          const percentage = value ? Math.max(8, (value / max) * 100) : 0

          return (
            <div key={`${item[labelKey]}-${value}`} style={styles.simpleBarColumn}>
              <div style={styles.simpleBarValue}>{value}</div>
              <div style={styles.simpleBarTrack}>
                <div
                  title={`${item[labelKey]}: ${value}`}
                  style={{
                    ...styles.simpleBar,
                    height: `${percentage}%`,
                    background: color
                  }}
                />
              </div>
              <div style={styles.simpleBarLabel} title={item[labelKey]}>
                {item[labelKey]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HorizontalBarChart({ data, valueKey, labelKey, color }: any) {
  const max = Math.max(...data.map((item: any) => Number(item[valueKey]) || 0), 1)

  return (
    <div style={styles.horizontalChart}>
      {data.map((item: any) => {
        const value = Number(item[valueKey]) || 0
        const percentage = value ? Math.max(4, (value / max) * 100) : 0

        return (
          <div key={`${item[labelKey]}-${value}`} style={styles.horizontalRow}>
            <div style={styles.horizontalLabel} title={item[labelKey]}>
              {item[labelKey]}
            </div>
            <div style={styles.horizontalTrack}>
              <div
                title={`${item[labelKey]}: ${value}`}
                style={{
                  ...styles.horizontalFill,
                  width: `${percentage}%`,
                  background: color
                }}
              />
            </div>
            <strong style={styles.horizontalValue}>{value}</strong>
          </div>
        )
      })}
    </div>
  )
}

function StatusDonutChart({ data, colors }: any) {
  const total = data.reduce((sum: number, item: any) => sum + Number(item.value || 0), 0)
  let accumulated = 0

  const gradient = data
    .map((item: any, index: number) => {
      const start = (accumulated / total) * 100
      accumulated += Number(item.value || 0)
      const end = (accumulated / total) * 100
      return `${colors[index]} ${start}% ${end}%`
    })
    .join(", ")

  return (
    <div style={styles.donutWrap}>
      <div style={{ ...styles.donut, background: `conic-gradient(${gradient})` }}>
        <div style={styles.donutCenter}>
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>

      <div style={styles.legendList}>
        {data.map((item: any, index: number) => (
          <div key={item.name} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: colors[index] }} />
            <span>{item.name}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildEmergencyHeatMap(emergencies: any[]) {
  const points: any = {}

  emergencies.forEach((emergency: any) => {
    const latitude = Number(emergency.latitude)
    const longitude = Number(emergency.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

    const normalizedLatitude = Number(latitude.toFixed(4))
    const normalizedLongitude = Number(longitude.toFixed(4))
    const key = `${normalizedLatitude},${normalizedLongitude}`

    if (!points[key]) {
      points[key] = {
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        municipality:
          emergency.municipality?.name ||
          emergency.user?.municipality?.name ||
          "Município não informado",
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        women: []
      }
    }

    points[key].total++

    const womanName = emergency.user?.name || "Assistida não informada"
    points[key].women.push(womanName)

    if (emergency.status === "PENDING") points[key].pending++
    if (emergency.status === "IN_PROGRESS") points[key].inProgress++
    if (emergency.status === "RESOLVED") points[key].resolved++
  })

  return Object.values(points).sort((a: any, b: any) => b.total - a.total)
}

function getHeatMapCenter(points: any[]): LatLngExpression {
  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length

  return [latitude, longitude]
}

function getHeatMapZoom(points: any[]) {
  return points.length === 1 ? 14 : 8
}

function getHeatRadius(total: number) {
  return Math.min(42, 10 + total * 5)
}

function getHeatColor(total: number) {
  if (total >= 10) return "#991b1b"
  if (total >= 5) return "#dc2626"
  if (total >= 2) return "#f97316"
  return "#f59e0b"
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

  mapIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  heatMapIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#fff7ed",
    color: "#ea580c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  visitsIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  heatMap: {
    height: 430,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#f9fafb"
  },

  popupWomen: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginTop: 8
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

  simpleBarChart: {
    width: "100%",
    overflowX: "auto",
    padding: "8px 4px 0"
  },

  simpleBarPlot: {
    minWidth: 420,
    height: "100%",
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(54px,1fr)",
    alignItems: "end",
    gap: 12,
    borderBottom: "1px solid #e5e7eb"
  },

  simpleBarColumn: {
    height: "100%",
    display: "grid",
    gridTemplateRows: "24px 1fr 38px",
    alignItems: "end",
    gap: 7,
    minWidth: 0
  },

  simpleBarValue: {
    textAlign: "center",
    color: "#374151",
    fontSize: 12,
    fontWeight: 900
  },

  simpleBarTrack: {
    height: "100%",
    minHeight: 160,
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
    background: "linear-gradient(to top, #f9fafb, #fff)",
    borderRadius: 10
  },

  simpleBar: {
    width: "68%",
    minHeight: 8,
    borderRadius: "9px 9px 0 0",
    boxShadow: "0 8px 16px rgba(15,23,42,0.12)"
  },

  simpleBarLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 800,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    alignSelf: "start"
  },

  horizontalChart: {
    display: "grid",
    gap: 12,
    maxHeight: 560,
    overflowY: "auto",
    paddingRight: 4
  },

  horizontalRow: {
    display: "grid",
    gridTemplateColumns: "minmax(110px,170px) 1fr 42px",
    alignItems: "center",
    gap: 12
  },

  horizontalLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },

  horizontalTrack: {
    height: 16,
    borderRadius: 999,
    background: "#f3f4f6",
    overflow: "hidden"
  },

  horizontalFill: {
    height: "100%",
    borderRadius: 999,
    minWidth: 8
  },

  horizontalValue: {
    color: "#111827",
    fontSize: 13,
    textAlign: "right"
  },

  donutWrap: {
    minHeight: 310,
    display: "grid",
    gridTemplateColumns: "minmax(190px,240px) 1fr",
    alignItems: "center",
    gap: 24
  },

  donut: {
    width: "min(220px, 100%)",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    justifySelf: "center"
  },

  donutCenter: {
    width: "52%",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 0 0 1px #eef2f7",
    color: "#111827"
  },

  legendList: {
    display: "grid",
    gap: 10
  },

  legendItem: {
    display: "grid",
    gridTemplateColumns: "12px 1fr auto",
    alignItems: "center",
    gap: 8,
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%"
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
