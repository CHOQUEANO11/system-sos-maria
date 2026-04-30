/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Clock, Eye } from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

type Emergency = {
  user: any
  id: string
  createdAt: string
  status: string
}

export default function Emergencies() {
  const { user } = useAuth()

  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [now, setNow] = useState(Date.now())

  const alertedRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const limit = 10

  useEffect(() => {
    audioRef.current = new Audio("/som.mp3")
    audioRef.current.volume = 1
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadEmergencies()
  }, [page])

  useEffect(() => {
    emergencies.forEach((item) => {
      if (item.status !== "PENDING") return

      const start = new Date(item.createdAt).getTime()
      const diffSec = (now - start) / 1000

      if (diffSec > 30 && !alertedRef.current.has(item.id)) {
        alertedRef.current.add(item.id)
        audioRef.current?.play().catch(() => {})
      }
    })
  }, [now, emergencies])

  const loadEmergencies = async () => {
    try {
      setLoading(true)

      const params: any = { page, limit }

      if (user?.name !== "CIEPAS") {
        params.municipalityId = user?.municipalityId
      }

      const token = localStorage.getItem("token")

      const response = await api.get("/emergencies", {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setEmergencies(response.data.data || [])
    } catch (error) {
      console.log("Erro ao carregar emergências", error)
    } finally {
      setLoading(false)
    }
  }

  function getElapsed(createdAt: string) {
    const start = new Date(createdAt).getTime()
    const diff = now - start

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  function getTimerStyle(createdAt: string) {
    const diffMin = (now - new Date(createdAt).getTime()) / (1000 * 60)

    if (diffMin < 1) return styles.timerOk
    if (diffMin < 5) return styles.timerWarn
    return styles.timerDanger
  }

  function getStatusLabel(status: string) {
    if (status === "PENDING") return "Pendente"
    if (status === "IN_PROGRESS") return "Em progresso"
    if (status === "RESOLVED") return "Atendido"
    return status
  }

  function getStatusStyle(status: string) {
    if (status === "PENDING") return styles.statusPending
    if (status === "IN_PROGRESS") return styles.statusProgress
    if (status === "RESOLVED") return styles.statusResolved
    return styles.statusDefault
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Pedidos de Ajuda</h2>
          <p style={styles.subtitle}>
            Acompanhe os acionamentos em tempo real e priorize os chamados pendentes.
          </p>
        </div>

        <div style={styles.summaryBadge}>
          <AlertTriangle size={18} />
          {emergencies.filter((e) => e.status === "PENDING").length} pendente(s)
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Ocorrências recebidas</h3>
            <p style={styles.cardSubtitle}>
              Página {page} • {emergencies.length} registro(s)
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Assistida</th>
                <th style={styles.th}>Município</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tempo</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={styles.empty}>
                    Carregando pedidos...
                  </td>
                </tr>
              )}

              {!loading && emergencies.length === 0 && (
                <tr>
                  <td colSpan={6} style={styles.empty}>
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}

              {!loading &&
                emergencies.map((item, index) => {
                  const date = new Date(item.createdAt)

                  return (
                    <tr
                      key={item.id}
                      style={{
                        ...styles.row,
                        background: index % 2 === 0 ? "#fff" : "#fafafa"
                      }}
                    >
                      <td style={styles.td}>
                        <strong style={styles.name}>{item.user?.name || "-"}</strong>
                        <span style={styles.phone}>{item.user?.phone || ""}</span>
                      </td>

                      <td style={styles.td}>
                        {item.user?.municipality?.name || "-"}
                      </td>

                      <td style={styles.td}>
                        {date.toLocaleString("pt-BR")}
                      </td>

                      <td style={styles.td}>
                        <span style={getStatusStyle(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {item.status === "PENDING" ? (
                          <span style={{ ...styles.timer, ...getTimerStyle(item.createdAt) }}>
                            <Clock size={14} />
                            {getElapsed(item.createdAt)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td style={styles.td}>
                        <Link to={`/emergency/${item.id}`} style={styles.detailsBtn}>
                          <Eye size={14} />
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Anterior
          </button>

          <span style={styles.pageText}>Página {page}</span>

          <button
            disabled={emergencies.length < limit}
            onClick={() => setPage(page + 1)}
            style={emergencies.length < limit ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  container: { width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  title: { margin: 0, color: "#111827", fontSize: 26, fontWeight: 800 },
  subtitle: { margin: "6px 0 0", color: "#6b7280", fontSize: 14 },
  summaryBadge: { display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: 999, fontWeight: 800 },
  card: { background: "#fff", padding: 22, borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 10px 28px rgba(15,23,42,0.06)" },
  cardHeader: { marginBottom: 16 },
  cardTitle: { margin: 0, color: "#111827", fontSize: 18 },
  cardSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 13 },
  tableWrapper: { width: "100%", overflowX: "auto", border: "1px solid #eef2f7", borderRadius: 12 },
  table: { width: "100%", minWidth: 900, borderCollapse: "collapse" },
  th: { background: "#f8fafc", color: "#374151", padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 800, borderBottom: "1px solid #e5e7eb" },
  row: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", color: "#374151", fontSize: 14, verticalAlign: "middle" },
  name: { display: "block", color: "#111827" },
  phone: { display: "block", color: "#6b7280", fontSize: 12, marginTop: 3 },
  empty: { padding: 28, textAlign: "center", color: "#9ca3af", fontWeight: 700 },
  statusPending: { background: "#fef2f2", color: "#b91c1c", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  statusProgress: { background: "#fffbeb", color: "#b45309", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  statusResolved: { background: "#ecfdf5", color: "#047857", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  statusDefault: { background: "#f3f4f6", color: "#374151", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  timer: { display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13 },
  timerOk: { color: "#059669" },
  timerWarn: { color: "#d97706" },
  timerDanger: { color: "#dc2626" },
  detailsBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 800 },
  pagination: { marginTop: 20, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pageBtn: { padding: "9px 14px", borderRadius: 9, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 800 },
  pageBtnDisabled: { padding: "9px 14px", borderRadius: 9, border: "none", background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontWeight: 800 },
  pageText: { padding: "9px 12px", borderRadius: 9, background: "#f9fafb", color: "#374151", fontSize: 13, fontWeight: 800 }
}
