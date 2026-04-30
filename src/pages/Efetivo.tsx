/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Plus } from "lucide-react"
import CreatePoliceModal from "../components/modals/CreatePoliceModal"

const graduacaoOrdem = [
  "SOLDADO",
  "CABO",
  "3º SARGENTO",
  "3° SARGENTO",
  "2º SARGENTO",
  "2° SARGENTO",
  "1º SARGENTO",
  "1° SARGENTO",
  "SUBTENENTE",
  "ASPIRANTE",
  "2º TENENTE",
  "2° TENENTE",
  "1º TENENTE",
  "1° TENENTE",
  "CAPITÃO",
  "CAPITAO",
  "MAJOR",
  "TEN CORONEL",
  "TENENTE CORONEL",
  "CORONEL"
]

function getGraduacaoPeso(nome?: string) {
  if (!nome) return 999

  const normalizado = nome.trim().toUpperCase()

  const index = graduacaoOrdem.findIndex((item) => item === normalizado)

  return index === -1 ? 999 : index
}

export default function Police() {
  const { user } = useAuth()

  const [police, setPolice] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const limit = 10

  const [open, setOpen] = useState(false)

  const loadPolice = async () => {
    try {
      setLoading(true)

      const params: any = {
        role: "POLICE",
        page,
        limit
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const res = await api.get("/users", { params })

      setPolice(res.data.data || [])
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolice()
  }, [page])

  const policeOrdenados = useMemo(() => {
    return [...police].sort((a: any, b: any) => {
      const gradA = a.policeProfile?.graduacao?.name
      const gradB = b.policeProfile?.graduacao?.name

      return getGraduacaoPeso(gradA) - getGraduacaoPeso(gradB)
    })
  }, [police])

  

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Efetivo Policial</h2>
          <p style={styles.subtitle}>
            Gerencie os policiais cadastrados, suas unidades e graduações.
          </p>
        </div>

        <button style={styles.primaryBtn} onClick={() => setOpen(true)}>
          <Plus size={18} />
          Novo Policial
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Policiais cadastrados</h3>
            <p style={styles.cardSubtitle}>
              Página {page} • {police.length} registro(s)
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Nome de Guerra</th>
                <th style={styles.th}>CPF</th>
                <th style={styles.th}>Unidade</th>
                <th style={styles.th}>Graduação</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td style={styles.loadingCell} colSpan={5}>
                    Carregando policiais...
                  </td>
                </tr>
              )}

              {!loading && policeOrdenados.length === 0 && (
                <tr>
                  <td style={styles.emptyCell} colSpan={5}>
                    Nenhum policial cadastrado
                  </td>
                </tr>
              )}

              {!loading &&
                policeOrdenados.map((p: any) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={styles.name}>{p.name}</strong>
                    </td>

                    <td style={styles.td}>
                      <strong style={styles.name}>{p.nomeDeGuerra || "-"}</strong>
                    </td>

                    <td style={styles.td}>
                      {p.cpf || "-"}
                    </td>

                    <td style={styles.td}>
                      {p.policeProfile?.unidade?.name || "-"}
                    </td>

                    <td style={styles.td}>  
                      <span style={styles.badge}>
                        {p.policeProfile?.graduacao?.name || "Sem graduação"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button
            style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>

          <span style={styles.pageInfo}>
            Página {page}
          </span>

          <button
            style={police.length < limit ? styles.pageBtnDisabled : styles.pageBtn}
            disabled={police.length < limit}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </button>
        </div>
      </div>

      <CreatePoliceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={loadPolice}
      />
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
    fontSize: 26,
    fontWeight: 800
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(99,102,241,0.25)"
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
    borderCollapse: "collapse",
    minWidth: 720
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
    fontSize: 14,
    verticalAlign: "middle"
  },

  name: {
    color: "#111827"
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
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
    fontWeight: 600
  },

  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },

  pageBtn: {
    padding: "9px 14px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 800
  },

  pageBtnDisabled: {
    padding: "9px 14px",
    background: "#e5e7eb",
    color: "#9ca3af",
    border: "none",
    borderRadius: 9,
    cursor: "not-allowed",
    fontWeight: 800
  },

  pageInfo: {
    padding: "9px 12px",
    borderRadius: 9,
    background: "#f9fafb",
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  }
}
