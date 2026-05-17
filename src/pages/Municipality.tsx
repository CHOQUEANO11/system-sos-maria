/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, MapPinned } from "lucide-react"
import { api } from "../services/api"
import CreateMunicipalityModal from "../components/modals/CreateMunicipalityModal"
import DeleteMunicipalityModal from "../components/modals/ModalConfirmDeleteMunicipality"

type Municipality = {
  id: string
  name: string
  createdAt: string
}

export default function Municipalities() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)

  const [page, setPage] = useState(1)
  const limit = 10

  const loadMunicipalities = async () => {
    try {
      setLoading(true)

      const response = await api.get("/municipalities", {
        params: { page, limit }
      })

      const result = response.data.data || response.data || []

      setMunicipalities(result)
    } catch (error) {
      console.log("Erro ao carregar municípios", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMunicipalities()
  }, [page])

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Municípios</h2>
            <p style={styles.subtitle}>
              Gerencie os municípios disponíveis para unidades, admins e assistidas.
            </p>
          </div>

          <button
            style={styles.primaryBtn}
            onClick={() => setOpenCreate(true)}
          >
            <Plus size={18} />
            Novo Município
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleArea}>
              <div style={styles.iconBox}>
                <MapPinned size={20} />
              </div>

              <div>
                <div style={styles.cardTitleRow}>
                  <h3 style={styles.cardTitle}>Municípios cadastrados</h3>
                  <span style={styles.totalBadge}>{municipalities.length}</span>
                </div>
                <p style={styles.cardSubtitle}>
                  Página {page} • {municipalities.length} registro(s)
                </p>
              </div>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Data de cadastro</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} style={styles.loadingCell}>
                      Carregando municípios...
                    </td>
                  </tr>
                )}

                {!loading && municipalities.length === 0 && (
                  <tr>
                    <td colSpan={3} style={styles.emptyCell}>
                      Nenhum município encontrado
                    </td>
                  </tr>
                )}

                {!loading &&
                  municipalities.map((m, index) => {
                    const date = new Date(m.createdAt)

                    return (
                      <tr
                        key={m.id}
                        style={{
                          ...styles.tr,
                          background: index % 2 === 0 ? "#fff" : "#fafafa"
                        }}
                      >
                        <td style={styles.td}>
                          <strong style={styles.name}>
                            {m.name}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {date.toLocaleDateString("pt-BR")}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button style={styles.editBtn}>
                              <Pencil size={15} />
                              Editar
                            </button>

                            <button
                              style={styles.deleteBtn}
                              onClick={() => {
                                setSelectedMunicipality(m)
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 size={15} />
                              Excluir
                            </button>
                          </div>
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

            <span style={styles.pageText}>
              Página {page}
            </span>

            <button
              disabled={municipalities.length < limit}
              onClick={() => setPage(page + 1)}
              style={municipalities.length < limit ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      <CreateMunicipalityModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadMunicipalities}
      />

      <DeleteMunicipalityModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        municipality={selectedMunicipality}
        onDeleted={loadMunicipalities}
      />
    </>
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
    gap: 8,
    alignItems: "center",
    padding: "11px 16px",
    background: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(236,72,153,0.25)"
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
    background: "#fdf2f8",
    color: "#db2777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18
  },

  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },

  totalBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    padding: "5px 10px",
    borderRadius: 999,
    background: "#fdf2f8",
    color: "#be185d",
    fontSize: 13,
    fontWeight: 900
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
    minWidth: 700,
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

  name: {
    color: "#111827"
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
  },

  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap"
  },

  editBtn: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 8,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800
  },

  deleteBtn: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 8,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
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
