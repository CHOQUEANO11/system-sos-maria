/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { ClipboardList, Search } from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function VisitRequests() {
  const { user } = useAuth()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const limit = 10

  const loadRequests = async () => {
    try {
      setLoading(true)

      const params: any = {
        role: user?.role,
        municipalityId: user?.municipalityId
      }

      const res = await api.get("/visit-requests", { params })

      setRequests(res.data || [])
    } catch (error) {
      console.log("Erro ao carregar solicitações", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) return requests

    return requests.filter((r: any) =>
      [
        r.user?.name,
        r.municipality?.name,
        r.motivo,
        r.status,
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : ""
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [requests, search])

  const totalPages = Math.ceil(filteredRequests.length / limit) || 1

  const paginatedRequests = filteredRequests.slice(
    (page - 1) * limit,
    page * limit
  )

  function getStatusStyle(status: string) {
    if (status === "PENDENTE") {
      return styles.statusPending
    }

    if (status === "ATENDIDA" || status === "RESOLVIDA") {
      return styles.statusDone
    }

    return styles.statusDefault
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Solicitações de Visita</h2>
          <p style={styles.subtitle}>
            Acompanhe os pedidos de visita enviados pelas assistidas.
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitleArea}>
            <div style={styles.iconBox}>
              <ClipboardList size={20} />
            </div>

            <div>
              <h3 style={styles.cardTitle}>Solicitações recebidas</h3>
              <p style={styles.cardSubtitle}>
                {filteredRequests.length} registro(s) encontrado(s)
              </p>
            </div>
          </div>

          <div style={styles.searchBox}>
            <Search size={17} />
            <input
              style={styles.searchInput}
              placeholder="Buscar por mulher, município, motivo ou status"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mulher</th>
                <th style={styles.th}>Município</th>
                <th style={styles.th}>Motivo</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Data</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={styles.empty}>
                    Carregando solicitações...
                  </td>
                </tr>
              )}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} style={styles.empty}>
                    Nenhuma solicitação encontrada
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedRequests.map((r: any, index: number) => (
                  <tr
                    key={r.id}
                    style={{
                      ...styles.row,
                      background: index % 2 === 0 ? "#fff" : "#fafafa"
                    }}
                  >
                    <td style={styles.td}>
                      <strong style={styles.name}>
                        {r.user?.name || "-"}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      {r.municipality?.name || "-"}
                    </td>

                    <td style={styles.td}>
                      {r.motivo || "-"}
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusStyle(r.status)}>
                        {r.status || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                  </tr>
                ))}
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

          <span style={styles.pageText}>
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={page === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  container: {
    width: "100%"
  },

  header: {
    marginBottom: 24
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
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap"
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
    background: "#fdf2f8",
    color: "#db2777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18,
    fontWeight: 800
  },

  cardSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "0 12px",
    minWidth: 280,
    flex: "0 1 380px"
  },

  searchInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "11px 0",
    fontSize: 14
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #eef2f7",
    borderRadius: 12
  },

  table: {
    width: "100%",
    minWidth: 850,
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

  td: {
    padding: "14px 16px",
    color: "#374151",
    fontSize: 14,
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top"
  },

  row: {
    transition: "background 0.2s"
  },

  name: {
    color: "#111827"
  },

  empty: {
    padding: 28,
    textAlign: "center",
    color: "#9ca3af",
    fontWeight: 700
  },

  statusPending: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 800
  },

  statusDone: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800
  },

  statusDefault: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 12,
    fontWeight: 800
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
    borderRadius: 9,
    border: "none",
    background: "#ec4899",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800
  },

  pageBtnDisabled: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "none",
    background: "#e5e7eb",
    color: "#9ca3af",
    cursor: "not-allowed",
    fontWeight: 800
  },

  pageText: {
    padding: "9px 12px",
    borderRadius: 9,
    background: "#f9fafb",
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  }
}
