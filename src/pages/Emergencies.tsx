/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Link } from "react-router-dom"
import { Fragment, useEffect, useRef, useState } from "react"
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, Eye, MapPin, Trash2 } from "lucide-react"
import { io, type Socket } from "socket.io-client"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"
import { toast } from "react-toastify"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import "leaflet/dist/leaflet.css"

import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
})

type Emergency = {
  user: any
  id: string
  createdAt: string
  status: string
  latitude: number
  longitude: number
  municipalityId?: string
  updatedAt?: string
}

export default function Emergencies() {
  const { user } = useAuth()

  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [now, setNow] = useState(Date.now())
  const [openMapId, setOpenMapId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const alertedRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const limit = 10

  useEffect(() => {
    audioRef.current = new Audio("/som.mp3")
    audioRef.current.volume = 1
    audioRef.current.loop = true
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadEmergencies()
  }, [page])

  useEffect(() => {
    const socketUrl = String(api.defaults.baseURL || window.location.origin)
    const socket = io(socketUrl, {
      auth: {
        token: localStorage.getItem("token")
      }
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id)
    })

    socket.on("emergency-created", (emergency: Emergency) => {
      if (!canReceiveEmergency(emergency)) return

      setEmergencies((prev) => {
        if (prev.some((item) => item.id === emergency.id)) return prev
        return [emergency, ...prev].slice(0, limit)
      })

      setPage(1)
      playEmergencyAlert()
      toast.error(
        `Novo pedido de ajuda: ${emergency.user?.name || "Assistida não informada"}`,
        { autoClose: 10000 }
      )
    })

    socket.on("emergency-updated", (emergency: Emergency) => {
      if (!canReceiveEmergency(emergency)) return

      setEmergencies((prev) =>
        prev.map((item) =>
          item.id === emergency.id
            ? { ...item, ...emergency }
            : item
        )
      )

      if (emergency.status === "RESOLVED") {
        stopEmergencyAlert()
        alertedRef.current.delete(emergency.id)

        toast.success(
          `Pedido de ${emergency.user?.name || "assistida"} marcado como atendido`
        )
      } else {
        toast.info(
          `Pedido de ${emergency.user?.name || "assistida"} atualizado para ${getStatusLabel(emergency.status)}`
        )
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?.municipalityId, user?.role, user?.name])

  useEffect(() => {
    if (!emergencies.some((item) => item.status === "PENDING")) {
      stopEmergencyAlert()
      return
    }

    emergencies.forEach((item) => {
      if (item.status !== "PENDING") return

      const start = new Date(item.createdAt).getTime()
      const diffSec = (now - start) / 1000

      if (diffSec > 30 && !alertedRef.current.has(item.id)) {
        alertedRef.current.add(item.id)
        playEmergencySound()
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

  function canReceiveEmergency(item: Emergency) {
    if (user?.role === "SUPER_ADMIN" || user?.name === "CIEPAS") return true
    if (user?.role === "ADMIN") {
      return item.municipalityId === user?.municipalityId ||
        item.user?.municipalityId === user?.municipalityId ||
        item.user?.municipality?.id === user?.municipalityId
    }

    return false
  }

  function playEmergencyAlert() {
    playEmergencySound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Novo pedido de ajuda", {
        body: "Uma assistida acionou o SOS Maria.",
        icon: "/sos2.png"
      })
    } else if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }

  function playEmergencySound() {
    const audio = audioRef.current

    if (!audio) return

    audio.play().catch(() => {})
  }

  function stopEmergencyAlert() {
    const audio = audioRef.current

    if (!audio) return

    audio.pause()
    audio.currentTime = 0
  }

  async function markAsResolved(item: Emergency) {
    try {
      setUpdatingId(item.id)

      const response = await api.put(`/emergencies/${item.id}/status`, {
        status: "RESOLVED"
      })

      const updated = response.data

      setEmergencies((prev) =>
        prev.map((current) =>
          current.id === item.id ? { ...current, ...updated } : current
        )
      )

      stopEmergencyAlert()
      alertedRef.current.delete(item.id)
      toast.success("Pedido marcado como atendido")
    } catch (error) {
      console.log("Erro ao atender pedido", error)
      toast.error("Erro ao marcar pedido como atendido")
    } finally {
      setUpdatingId(null)
    }
  }

  function canDeleteEmergency() {
    return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  }

  function confirmDeleteEmergency(item: Emergency) {
    if (!canDeleteEmergency() || deletingId) return

    const toastId = `delete-emergency-${item.id}`

    toast.warning(
      ({ closeToast }) => (
        <div>
          <strong>Excluir pedido de ajuda?</strong>
          <p style={styles.confirmToastText}>
            O pedido de {item.user?.name || "assistida não informada"} será excluído permanentemente.
          </p>

          <div style={styles.confirmToastActions}>
            <button
              type="button"
              style={styles.confirmCancelBtn}
              onClick={closeToast}
            >
              Cancelar
            </button>

            <button
              type="button"
              style={styles.confirmDeleteBtn}
              onClick={() => {
                closeToast?.()
                deleteEmergency(item)
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      ),
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    )
  }

  async function deleteEmergency(item: Emergency) {
    if (!canDeleteEmergency() || deletingId) return

    try {
      setDeletingId(item.id)

      await api.delete(`/emergencies/${item.id}`)

      alertedRef.current.delete(item.id)
      setOpenMapId((current) => current === item.id ? null : current)

      const remaining = emergencies.filter((current) => current.id !== item.id)
      setEmergencies(remaining)

      if (!remaining.some((current) => current.status === "PENDING")) {
        stopEmergencyAlert()
      }

      toast.success("Pedido de ajuda excluído com sucesso.")

      if (remaining.length === 0 && page > 1) {
        setPage((current) => Math.max(current - 1, 1))
      } else {
        await loadEmergencies()
      }
    } catch (error) {
      console.log("Erro ao excluir pedido de ajuda", error)
      toast.error("Erro ao excluir pedido de ajuda.")
    } finally {
      setDeletingId(null)
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

  function getAttendanceDuration(item: Emergency) {
    const endDate = item.updatedAt || item.createdAt
    const diff = new Date(endDate).getTime() - new Date(item.createdAt).getTime()

    if (!Number.isFinite(diff) || diff < 0) return "-"

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
                  const isMapOpen = openMapId === item.id
                  const hasCoordinates = Number.isFinite(Number(item.latitude)) &&
                    Number.isFinite(Number(item.longitude))
                  const position: LatLngExpression = [
                    Number(item.latitude),
                    Number(item.longitude)
                  ]

                  return (
                    <Fragment key={item.id}>
                      <tr
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
                        ) : item.status === "RESOLVED" ? (
                          <span style={styles.attendanceTimer}>
                            <CheckCircle size={14} />
                            {getAttendanceDuration(item)}
                          </span>
                        ) : (
                          "-"
                        )}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <Link to={`/emergency/${item.id}`} style={styles.detailsBtn}>
                              <Eye size={14} />
                              Detalhes
                            </Link>

                            <button
                              type="button"
                              style={hasCoordinates ? styles.mapToggleBtn : styles.mapToggleDisabled}
                              disabled={!hasCoordinates}
                              onClick={() => setOpenMapId(isMapOpen ? null : item.id)}
                            >
                              <MapPin size={14} />
                              Mapa
                              {isMapOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {item.status !== "RESOLVED" && (
                              <button
                                type="button"
                                style={styles.resolveBtn}
                                disabled={updatingId === item.id}
                                onClick={() => markAsResolved(item)}
                              >
                                <CheckCircle size={14} />
                                {updatingId === item.id ? "Salvando..." : "Atendido"}
                              </button>
                            )}

                            {canDeleteEmergency() && (
                              <button
                                type="button"
                                title="Excluir pedido de ajuda"
                                style={deletingId === item.id ? styles.deleteBtnDisabled : styles.deleteBtn}
                                disabled={deletingId === item.id}
                                onClick={() => confirmDeleteEmergency(item)}
                              >
                                <Trash2 size={14} />
                                {deletingId === item.id ? "Excluindo..." : "Excluir"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isMapOpen && hasCoordinates && (
                        <tr>
                          <td colSpan={6} style={styles.mapAccordionCell}>
                            <div style={styles.mapAccordionHeader}>
                              <div>
                                <strong style={styles.mapTitle}>
                                  Local do disparo
                                </strong>
                                <p style={styles.mapSubtitle}>
                                  Latitude {item.latitude} • Longitude {item.longitude}
                                </p>
                              </div>

                              <a
                                href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.openMapsBtn}
                              >
                                Direcionar no mapa
                              </a>
                            </div>

                            <div style={styles.inlineMap}>
                              <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
                                <TileLayer
                                  attribution="© OpenStreetMap"
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <Marker position={position}>
                                  <Popup>
                                    {item.user?.name || "Pedido de ajuda"}
                                  </Popup>
                                </Marker>
                              </MapContainer>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
  attendanceTimer: { display: "inline-flex", alignItems: "center", gap: 6, color: "#047857", fontWeight: 900, fontSize: 13 },
  detailsBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 800 },
  actionGroup: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  mapToggleBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#fdf2f8", color: "#be185d", border: "1px solid #fbcfe8", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" },
  mapToggleDisabled: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#f3f4f6", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "not-allowed" },
  resolveBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" },
  deleteBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" },
  deleteBtnDisabled: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#e5e7eb", color: "#9ca3af", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "not-allowed" },
  confirmToastText: { margin: "8px 0 12px", color: "#4b5563", fontSize: 13, lineHeight: 1.4 },
  confirmToastActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  confirmCancelBtn: { padding: "7px 11px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 },
  confirmDeleteBtn: { padding: "7px 11px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 },
  mapAccordionCell: { padding: 16, background: "#f8fafc", borderBottom: "1px solid #e5e7eb" },
  mapAccordionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  mapTitle: { color: "#111827", fontSize: 14 },
  mapSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 12 },
  openMapsBtn: { display: "inline-flex", alignItems: "center", padding: "9px 12px", background: "#ec4899", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 800 },
  inlineMap: { height: 320, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" },
  pagination: { marginTop: 20, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pageBtn: { padding: "9px 14px", borderRadius: 9, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 800 },
  pageBtnDisabled: { padding: "9px 14px", borderRadius: 9, border: "none", background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontWeight: 800 },
  pageText: { padding: "9px 12px", borderRadius: 9, background: "#f9fafb", color: "#374151", fontSize: 13, fontWeight: 800 }
}
