/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { FileText, HeartPulse, X, UserRound } from "lucide-react"
import { api } from "../../services/api"

export default function ViewWomanModal({ isOpen, onClose, woman }: any) {
  const [reports, setReports] = useState<any[]>([])
  const [emotions, setEmotions] = useState<any[]>([])
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

      const [reportsRes, emotionsRes] = await Promise.all([
        api.get(`/reports/${woman.id}`),
        api.get(`/daily-emotions/${woman.id}`)
      ])

      setReports(reportsRes.data || [])
      setEmotions(emotionsRes.data || [])
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
        </div>
      </div>
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
