/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import { ArrowLeft, MapPin, Phone, User, Clock } from "lucide-react"
import { api } from "../services/api"
import L from "leaflet"
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
  id: string
  latitude: number
  longitude: number
  status: string
  createdAt: string
  user: {
    name: string
    phone: string
    municipality: {
      name: string
    }
  }
}

export default function EmergencyDetail() {
  const { id } = useParams()

  const [emergency, setEmergency] = useState<Emergency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmergency()
  }, [])

  const loadEmergency = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await api.get(`/emergencies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setEmergency(response.data)
    } catch (error) {
      console.log("Erro ao carregar emergência", error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <div style={styles.spinner}></div>
        <p>Carregando emergência...</p>

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

  if (!emergency) {
    return (
      <div style={styles.emptyBox}>
        <h3>Emergência não encontrada</h3>
        <Link to="/emergencies" style={styles.backBtn}>Voltar</Link>
      </div>
    )
  }

  const position: LatLngExpression = [
    emergency.latitude,
    emergency.longitude
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to="/emergencies" style={styles.backLink}>
            <ArrowLeft size={16} />
            Voltar
          </Link>

          <h2 style={styles.title}>Detalhes da Emergência</h2>
          <p style={styles.subtitle}>
            Acionamento recebido em {new Date(emergency.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>

        <span style={getStatusStyle(emergency.status)}>
          {getStatusLabel(emergency.status)}
        </span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.iconBox}><User size={20} /></div>
          <span style={styles.label}>Assistida</span>
          <strong style={styles.value}>{emergency.user.name}</strong>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.iconBox}><Phone size={20} /></div>
          <span style={styles.label}>Telefone</span>
          <strong style={styles.value}>{emergency.user.phone || "-"}</strong>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.iconBox}><MapPin size={20} /></div>
          <span style={styles.label}>Município</span>
          <strong style={styles.value}>{emergency.user.municipality?.name || "-"}</strong>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.iconBox}><Clock size={20} /></div>
          <span style={styles.label}>Data do pedido</span>
          <strong style={styles.value}>
            {new Date(emergency.createdAt).toLocaleDateString("pt-BR")}
          </strong>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.mapHeader}>
          <div>
            <h3 style={styles.cardTitle}>Localização da ocorrência</h3>
            <p style={styles.cardSubtitle}>
              Latitude {emergency.latitude} • Longitude {emergency.longitude}
            </p>
          </div>

          <a
            href={`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`}
            target="_blank"
            rel="noreferrer"
            style={styles.mapBtn}
          >
            Abrir no mapa
          </a>
        </div>

        <div style={styles.map}>
          <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>Pedido de ajuda</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  container: { width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  backLink: { display: "inline-flex", alignItems: "center", gap: 6, color: "#6366f1", textDecoration: "none", fontWeight: 800, marginBottom: 10 },
  title: { margin: 0, color: "#111827", fontSize: 26, fontWeight: 800 },
  subtitle: { margin: "6px 0 0", color: "#6b7280", fontSize: 14 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginBottom: 20 },
  infoCard: { background: "#fff", border: "1px solid #eef2f7", borderRadius: 14, padding: 18, boxShadow: "0 10px 28px rgba(15,23,42,0.05)" },
  iconBox: { width: 40, height: 40, borderRadius: 12, background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  label: { display: "block", color: "#6b7280", fontSize: 13, marginBottom: 4 },
  value: { color: "#111827", fontSize: 16 },
  card: { background: "#fff", padding: 22, borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 10px 28px rgba(15,23,42,0.06)" },
  mapHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  cardTitle: { margin: 0, color: "#111827", fontSize: 18 },
  cardSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 13 },
  mapBtn: { background: "#6366f1", color: "#fff", padding: "10px 14px", borderRadius: 9, textDecoration: "none", fontWeight: 800, fontSize: 13 },
  map: { height: 440, borderRadius: 14, overflow: "hidden", border: "1px solid #e5e7eb" },
  statusPending: { background: "#fef2f2", color: "#b91c1c", padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 },
  statusProgress: { background: "#fffbeb", color: "#b45309", padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 },
  statusResolved: { background: "#ecfdf5", color: "#047857", padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 },
  statusDefault: { background: "#f3f4f6", color: "#374151", padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 },
  loadingBox: { minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#6b7280", gap: 12 },
  spinner: { width: 44, height: 44, border: "5px solid #eee", borderTop: "5px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyBox: { background: "#fff", border: "1px dashed #d1d5db", borderRadius: 14, padding: 32, textAlign: "center" },
  backBtn: { display: "inline-block", marginTop: 10, background: "#6366f1", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 800 }
}
