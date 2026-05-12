/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Plus, Eye, Pencil, Trash2, Users } from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import CreateWomanModal from "../components/modals/CreateWomanModal"
import EditWomanModal from "../components/modals/EditWomanModal"
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal"
import ViewWomanModal from "../components/modals/ViewWomanModal"

type Woman = {
  id: string
  name: string
  cpf: string
  municipalityId?: string
  municipality?: {
    name: string
  }
  status?: string
  programStartDate?: string
  programEndDate?: string
}

export default function Women() {
  const { user } = useAuth()

  const [women, setWomen] = useState<Woman[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const [selectedWoman, setSelectedWoman] = useState<any>(null)
  const [totalWomen, setTotalWomen] = useState(0)


  const [page, setPage] = useState(1)
  const limit = 10

  const loadWomen = async () => {
    try {
      setLoading(true)

      const params: any = {
        role: "WOMAN",
        page,
        limit
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const response = await api.get("/users", { params })
      setWomen(response.data.data || [])
      setTotalWomen(response.data.total || 0)
    } catch (error) {
      console.log("Erro ao carregar mulheres", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWomen()
  }, [page])

  function handleView(woman: any) {
    setSelectedWoman(woman)
    setViewOpen(true)
  }

  function handleEdit(woman: any) {
    setSelectedWoman(woman)
    setEditOpen(true)
  }

  function handleDelete(woman: any) {
    setSelectedWoman(woman)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!selectedWoman || deleting) return

    try {
      setDeleting(true)

      await api.delete(`/users/${selectedWoman.id}`)

      setDeleteOpen(false)
      setSelectedWoman(null)

      await loadWomen()
    } catch (error) {
      console.log("Erro ao excluir mulher", error)
      alert("Erro ao excluir cadastro.")
    } finally {
      setDeleting(false)
    }
  }

  function toDateBR(value?: string) {
  if (!value) return ""

  const dateOnly = value.slice(0, 10)
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) return ""

  return `${day}/${month}/${year}`
}

function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "")

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14)
}



  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Mulheres Cadastradas</h2>
            <p style={styles.subtitle}>
              Consulte, cadastre e acompanhe as assistidas vinculadas ao sistema.
            </p>
          </div>

          <button style={styles.primaryBtn} onClick={() => setOpen(true)}>
            <Plus size={18} />
            Nova Mulher
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleArea}>
              <div style={styles.iconBox}>
                <Users size={20} />
              </div>

              <div>
                <h3 style={styles.cardTitle}>Assistidas cadastradas - {totalWomen}</h3>

                <p style={styles.cardSubtitle}>
                  Página {page} • {women.length} registro(s)
                </p>
              </div>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Município</th>
                  <th style={styles.th}>Data de Início</th>
                  <th style={styles.th}>Data de Término</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      Carregando mulheres...
                    </td>
                  </tr>
                )}

                {!loading && women.length === 0 && (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      Nenhuma mulher cadastrada
                    </td>
                  </tr>
                )}

                {!loading &&
                  women.map((woman, index) => {
                    const isInactive = woman.status === "Inativa"

                    return (
                      <tr
                        key={woman.id}
                        style={{
                          ...styles.row,
                          background: index % 2 === 0 ? "#fff" : "#fafafa"
                        }}
                      >
                        <td style={styles.td}>
                          <strong style={styles.name}>{woman.name}</strong>
                        </td>

                        <td style={styles.td}>{formatCPF(woman.cpf) || "-"}</td>

                        <td style={styles.td}>
                          {woman.municipality?.name || "-"}
                        </td>

                        <td style={styles.td}>
                          {toDateBR(woman.programStartDate) || "-"}
                        </td>

                        <td style={styles.td}>
                          {toDateBR(woman.programEndDate) || "-"}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background: isInactive ? "#fee2e2" : "#dcfce7",
                              color: isInactive ? "#b91c1c" : "#166534"
                            }}
                          >
                            {woman.status || "Ativa"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button
                              style={styles.viewBtn}
                              onClick={() => handleView(woman)}
                            >
                              <Eye size={15} />
                              Ver
                            </button>

                            <button
                              style={styles.editBtn}
                              onClick={() => handleEdit(woman)}
                            >
                              <Pencil size={15} />
                              Editar
                            </button>

                            <button
                              style={styles.deleteBtn}
                              onClick={() => handleDelete(woman)}
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

            <span style={styles.pageText}>Página {page}</span>

            <button
              disabled={women.length < limit}
              onClick={() => setPage(page + 1)}
              style={women.length < limit ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      <CreateWomanModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={loadWomen}
      />

      <EditWomanModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={loadWomen}
        woman={selectedWoman}
      />

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        name={selectedWoman?.name}
        loading={deleting}
      />

      <ViewWomanModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        woman={selectedWoman}
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
    fontWeight: 800
  },

  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)"
  },

  cardHeader: {
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
    borderBottom: "1px solid #f1f5f9"
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

  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },

  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800
  },

  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800
  },

  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "#fff",
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
