/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { AlertTriangle, CalendarCheck, Eye, FileText, HeartPulse, MapPin, ShieldCheck, X, UserRound } from "lucide-react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"
import { api } from "../../services/api"
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

export default function ViewWomanModal({ isOpen, onClose, woman }: any) {
  const [reports, setReports] = useState<any[]>([])
  const [emotions, setEmotions] = useState<any[]>([])
  const [visits, setVisits] = useState<any[]>([])
  const [emergencies, setEmergencies] = useState<any[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null)
  const [tab, setTab] = useState("reports")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (woman && isOpen) {
      loadData()
    }
  }, [woman, isOpen])

  async function loadData() {
    try {
      setLoading(true)

      const [reportsRes, emotionsRes, visitsRes, emergenciesRes] = await Promise.all([
        api.get(`/reports/${woman.id}`),
        api.get(`/daily-emotions/${woman.id}`),
        api.get("/appointment/atendimentos"),
        api.get("/emergencies", { params: { userId: woman.id, limit: 9999 } })
      ])

      const appointments = visitsRes.data?.data || visitsRes.data || []
      const emergencyItems = emergenciesRes.data?.data || emergenciesRes.data || []
      const womanVisits = appointments.filter((appointment: any) =>
        appointment.womanId === woman.id ||
        appointment.userId === woman.id ||
        appointment.agenda?.womanId === woman.id ||
        appointment.agenda?.woman?.id === woman.id
      )

      setReports(reportsRes.data || [])
      setEmotions(emotionsRes.data || [])
      setVisits(womanVisits)
      setEmergencies(emergencyItems.filter((emergency: any) =>
        emergency.userId === woman.id ||
        emergency.user?.id === woman.id
      ))
    } catch (error) {
      console.log("Erro ao carregar dados da mulher", error)
    } finally {
      setLoading(false)
    }
  }

  function calculateEmotionScore() {
    const weights: any = {
      BEM: 0,
      TRISTE: 1,
      PREOCUPADA: 2,
      CHORANDO: 3,
      MEDO: 4,
      ANSIEDADE: 3,
      SOLIDAO: 3,
      PERIGO: 5
    }

    const total = emotions.reduce((sum: number, e: any) => {
      return sum + (weights[e.emotion] || 0)
    }, 0)

    const max = emotions.length * 5
    return max ? Math.round((total / max) * 100) : 0
  }

  function getRiskColor(risk: number) {
    if (risk < 30) return "#10b981"
    if (risk < 70) return "#f59e0b"
    return "#ef4444"
  }

  const risk = calculateEmotionScore()

  if (!isOpen || !woman) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            <div style={styles.avatar}>
              <UserRound size={24} />
            </div>

            <div>
              <h2 style={styles.name}>{woman.name}</h2>
              <span style={styles.subtitle}>
                {woman.municipality?.name || "Município não informado"}
              </span>
            </div>
          </div>

          <button style={styles.close} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.infoGrid}>
          <InfoCard label="CPF" value={woman.cpf || "-"} />
          <InfoCard label="Município" value={woman.municipality?.name || "-"} />
          <InfoCard label="Idade" value={woman.age ? `${woman.age} anos` : "-"} />
          <InfoCard label="Raça" value={woman.race || "-"} />
          <InfoCard label="Cor" value={woman.color || "-"} />
          <InfoCard label="Escolaridade" value={woman.education || "-"} />

          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Risco emocional</span>

            <div style={styles.riskRow}>
              <div style={styles.riskBar}>
                <div
                  style={{
                    ...styles.riskFill,
                    width: `${risk}%`,
                    background: getRiskColor(risk)
                  }}
                />
              </div>

              <strong style={{ color: getRiskColor(risk) }}>
                {risk}%
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={tab === "reports" ? styles.tabActive : styles.tab}
            onClick={() => setTab("reports")}
          >
            <FileText size={16} />
            Fatos
          </button>

          <button
            style={tab === "emotions" ? styles.tabActive : styles.tab}
            onClick={() => setTab("emotions")}
          >
            <HeartPulse size={16} />
            Emoções
          </button>

          <button
            style={tab === "visits" ? styles.tabActive : styles.tab}
            onClick={() => setTab("visits")}
          >
            <CalendarCheck size={16} />
            Visitas
          </button>

          <button
            style={tab === "emergencies" ? styles.tabActive : styles.tab}
            onClick={() => setTab("emergencies")}
          >
            <AlertTriangle size={16} />
            Emergências
          </button>
        </div>

        <div style={styles.content}>
          {loading && <p style={styles.empty}>Carregando informações...</p>}

          {!loading && tab === "reports" && (
            <>
              {reports.length === 0 && (
                <p style={styles.empty}>Nenhum fato registrado</p>
              )}

              {reports.map((r: any) => (
                <div key={r.id} style={styles.reportCard}>
                  <div style={styles.reportDate}>
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </div>

                  <p style={styles.reportText}>{r.description}</p>
                </div>
              ))}
            </>
          )}

          {!loading && tab === "emotions" && (
            <>
              {emotions.length === 0 && (
                <p style={styles.empty}>Nenhuma emoção registrada</p>
              )}

              {emotions.map((e: any) => (
                <div key={e.id} style={styles.emotionCard}>
                  <strong>{e.emotion}</strong>

                  <span style={styles.date}>
                    {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </>
          )}

          {!loading && tab === "visits" && (
            <>
              {visits.length === 0 && (
                <p style={styles.empty}>Nenhuma visita realizada</p>
              )}

              {visits.map((visit: any) => (
                <div key={visit.id} style={styles.visitCard}>
                  <div style={styles.visitHeader}>
                    <div>
                      <strong style={styles.visitTitle}>
                        {visit.agenda?.municipality?.name ||
                          visit.municipality?.name ||
                          woman.municipality?.name ||
                          "Município não informado"}
                      </strong>

                      <span style={styles.date}>
                        {formatDateTime(visit.createdAt || visit.agenda?.date)}
                      </span>
                    </div>

                    <span style={styles.visitBadge}>Realizada</span>
                  </div>

                  <div style={styles.policeSection}>
                    <div style={styles.policeTitle}>
                      <ShieldCheck size={16} />
                      Policiais na visita
                    </div>

                    <div style={styles.policeList}>
                      {getVisitPolice(visit).length === 0 ? (
                        <span style={styles.mutedText}>Nenhum policial informado</span>
                      ) : (
                        getVisitPolice(visit).map((police: string, index: number) => (
                          <span key={`${visit.id}-${police}-${index}`} style={styles.policeBadge}>
                            {police}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {visit.tipoViolencia?.length > 0 && (
                    <p style={styles.visitText}>
                      <strong>Tipo de violência:</strong> {visit.tipoViolencia.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}

          {!loading && tab === "emergencies" && (
            <>
              {emergencies.length === 0 && (
                <p style={styles.empty}>Nenhum pedido de ajuda registrado</p>
              )}

              {emergencies.map((emergency: any) => (
                <div key={emergency.id} style={styles.emergencyCard}>
                  <div style={styles.emergencyHeader}>
                    <div>
                      <strong style={styles.visitTitle}>
                        Pedido de ajuda
                      </strong>

                      <span style={styles.date}>
                        {formatDateTime(emergency.createdAt)}
                      </span>
                    </div>

                    <span style={getEmergencyStatusStyle(emergency.status)}>
                      {getEmergencyStatusLabel(emergency.status)}
                    </span>
                  </div>

                  <div style={styles.emergencyDetails}>
                    <span>
                      <MapPin size={15} />
                      {emergency.user?.municipality?.name ||
                        emergency.municipality?.name ||
                        woman.municipality?.name ||
                        "Município não informado"}
                    </span>

                    <span>
                      Latitude {emergency.latitude || "-"} • Longitude {emergency.longitude || "-"}
                    </span>
                  </div>

                  <button
                    style={styles.mapButton}
                    onClick={() => setSelectedEmergency(emergency)}
                    disabled={!hasEmergencyLocation(emergency)}
                  >
                    <Eye size={15} />
                    Ver mapa e detalhes
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {selectedEmergency && (
        <EmergencyMapModal
          emergency={selectedEmergency}
          woman={woman}
          onClose={() => setSelectedEmergency(null)}
        />
      )}
    </div>
  )
}

function InfoCard({ label, value }: any) {
  return (
    <div style={styles.infoCard}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function formatDateTime(value?: string) {
  if (!value) return "Data não informada"

  return new Date(value).toLocaleString("pt-BR")
}

function getVisitPolice(visit: any) {
  const scheduledPolice =
    visit.agenda?.militares
      ?.map((item: any) =>
        `${item.police?.graduacao?.name || ""} ${item.police?.user?.name || ""}`.trim()
      )
      .filter(Boolean) || []

  const registeredBy = `${visit.police?.graduacao?.name || ""} ${visit.police?.user?.name || ""}`.trim()

  return Array.from(new Set([...scheduledPolice, registeredBy].filter(Boolean)))
}

function getEmergencyStatusLabel(status: string) {
  if (status === "PENDING") return "Pendente"
  if (status === "IN_PROGRESS") return "Em progresso"
  if (status === "RESOLVED") return "Atendido"
  return status || "-"
}

function getEmergencyStatusStyle(status: string) {
  if (status === "PENDING") return styles.statusPending
  if (status === "IN_PROGRESS") return styles.statusProgress
  if (status === "RESOLVED") return styles.statusResolved
  return styles.statusDefault
}

function hasEmergencyLocation(emergency: any) {
  return Number.isFinite(Number(emergency.latitude)) && Number.isFinite(Number(emergency.longitude))
}

function EmergencyMapModal({ emergency, woman, onClose }: any) {
  const position: LatLngExpression = [
    Number(emergency.latitude),
    Number(emergency.longitude)
  ]

  return (
    <div style={styles.mapOverlay}>
      <div style={styles.mapModal}>
        <div style={styles.mapModalHeader}>
          <div>
            <h3 style={styles.mapModalTitle}>Detalhes do pedido de ajuda</h3>
            <p style={styles.mapModalSubtitle}>
              {formatDateTime(emergency.createdAt)}
            </p>
          </div>

          <button style={styles.close} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.mapInfoGrid}>
          <InfoCard label="Assistida" value={emergency.user?.name || woman.name || "-"} />
          <InfoCard label="Telefone" value={emergency.user?.phone || woman.phone || "-"} />
          <InfoCard
            label="Município"
            value={
              emergency.user?.municipality?.name ||
              emergency.municipality?.name ||
              woman.municipality?.name ||
              "-"
            }
          />
          <InfoCard label="Status" value={getEmergencyStatusLabel(emergency.status)} />
        </div>

        <div style={styles.mapModalHeader}>
          <div>
            <h4 style={styles.mapSectionTitle}>Localização da ocorrência</h4>
            <p style={styles.mapModalSubtitle}>
              Latitude {emergency.latitude} • Longitude {emergency.longitude}
            </p>
          </div>

          <a
            href={`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`}
            target="_blank"
            rel="noreferrer"
            style={styles.externalMapButton}
          >
            Abrir no mapa
          </a>
        </div>

        <div style={styles.mapBox}>
          <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>Pedido de ajuda de {emergency.user?.name || woman.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16
  },

  modal: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "90vh",
    background: "#fff",
    borderRadius: 16,
    padding: 26,
    overflowY: "auto",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24
  },

  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#fdf2f8",
    color: "#db2777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  name: {
    margin: 0,
    color: "#111827",
    fontSize: 24,
    fontWeight: 900
  },

  subtitle: {
    display: "block",
    color: "#6b7280",
    marginTop: 4
  },

  close: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 14,
    marginBottom: 22
  },

  infoCard: {
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    padding: 15,
    borderRadius: 12
  },

  infoLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 700
  },

  infoValue: {
    color: "#111827",
    fontSize: 15
  },

  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },

  riskBar: {
    flex: 1,
    height: 8,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden"
  },

  riskFill: {
    height: "100%",
    borderRadius: 999
  },

  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap"
  },

  tab: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 800
  },

  tabActive: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 14px",
    borderRadius: 9,
    background: "#ec4899",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 800
  },

  content: {
    minHeight: 220
  },

  reportCard: {
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },

  reportDate: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: 800
  },

  reportText: {
    margin: 0,
    color: "#374151",
    lineHeight: 1.5
  },

  emotionCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    padding: 13,
    borderRadius: 12,
    marginBottom: 10
  },

  visitCard: {
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },

  visitHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14
  },

  visitTitle: {
    display: "block",
    color: "#111827",
    fontSize: 15,
    marginBottom: 4
  },

  visitBadge: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap"
  },

  policeSection: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: 10,
    padding: 12
  },

  policeTitle: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#374151",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 10
  },

  policeList: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },

  policeBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800
  },

  mutedText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 700
  },

  visitText: {
    margin: "12px 0 0",
    color: "#374151",
    lineHeight: 1.5
  },

  emergencyCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },

  emergencyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12
  },

  emergencyDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "#374151",
    fontSize: 13,
    marginBottom: 12
  },

  statusPending: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap"
  },

  statusProgress: {
    background: "#fffbeb",
    color: "#b45309",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap"
  },

  statusResolved: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap"
  },

  statusDefault: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap"
  },

  mapButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: "none",
    borderRadius: 9,
    background: "#dc2626",
    color: "#fff",
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 900
  },

  mapOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.56)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: 16
  },

  mapModal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "92vh",
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.24)"
  },

  mapModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap"
  },

  mapModalTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
    fontWeight: 900
  },

  mapModalSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13
  },

  mapInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
    marginBottom: 18
  },

  mapSectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 16,
    fontWeight: 900
  },

  externalMapButton: {
    background: "#6366f1",
    color: "#fff",
    padding: "10px 13px",
    borderRadius: 9,
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13
  },

  mapBox: {
    height: 430,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #e5e7eb"
  },

  date: {
    color: "#6b7280",
    fontSize: 12
  },

  empty: {
    color: "#9ca3af",
    fontWeight: 700,
    textAlign: "center",
    padding: 24
  }
}
