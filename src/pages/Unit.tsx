 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Building2, Plus } from "lucide-react"
import { api } from "../services/api"
import CreateUnidadeModal from "../components/modals/CreateUnidadeModal"

export default function Unidades() {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await api.get("/unidades")
      setData(res.data || [])
    } catch (error) {
      console.log("Erro ao carregar unidades", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Unidades</h2>
          <p style={styles.subtitle}>
            Cadastre e acompanhe as unidades vinculadas aos municípios.
          </p>
        </div>

        <button style={styles.btnPrimary} onClick={() => setOpen(true)}>
          <Plus size={18} />
          Nova Unidade
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitleArea}>
            <div style={styles.iconBox}>
              <Building2 size={20} />
            </div>

            <div>
              <h3 style={styles.cardTitle}>Unidades cadastradas</h3>
              <p style={styles.cardSubtitle}>
                {data.length} registro(s) encontrado(s)
              </p>
            </div>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Município</th>
                <th style={styles.th}>Endereço</th>
                <th style={styles.th}>Telefone</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td style={styles.loadingCell} colSpan={4}>
                    Carregando unidades...
                  </td>
                </tr>
              )}

              {!loading && data.length === 0 && (
                <tr>
                  <td style={styles.emptyCell} colSpan={4}>
                    Nenhuma unidade cadastrada
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((u: any) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={styles.unitName}>{u.name}</strong>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {u.municipality?.name || "Sem município"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {u.address || "-"}
                    </td>

                    <td style={styles.td}>
                      {u.phone || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUnidadeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={load}
      />
    </div>
  )
}

const styles: any = {
  container: {
    padding: 30,
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
    fontSize: 26,
    fontWeight: 800
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#10b981",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(16,185,129,0.25)"
  },

  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },

  cardTitleArea: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18
  },

  cardSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #eef2f7",
    borderRadius: 12
  },

  table: {
    width: "100%",
    minWidth: 760,
    borderCollapse: "collapse"
  },

  th: {
    background: "#f8fafc",
    color: "#374151",
    padding: "14px 16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 800,
    borderBottom: "1px solid #e5e7eb"
  },

  tr: {
    borderBottom: "1px solid #f1f5f9"
  },

  td: {
    padding: "14px 16px",
    color: "#374151",
    fontSize: 14
  },

  unitName: {
    color: "#111827"
  },

  badge: {
    display: "inline-block",
    background: "#ecfdf5",
    color: "#047857",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800
  },

  loadingCell: {
    padding: 24,
    textAlign: "center",
    color: "#6b7280"
  },

  emptyCell: {
    padding: 28,
    textAlign: "center",
    color: "#9ca3af",
    fontWeight: 700
  }
}
