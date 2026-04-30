/* eslint-disable @typescript-eslint/no-explicit-any */

import { Plus, Pencil, Trash2, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import CreateAdminModal from "../components/modals/CreateAdminModal"

type Admin = {
  id: string
  name: string
  email: string
  municipalityId?: string
  municipality?: {
    name: string
  }
}

export default function Admins() {
  const { user } = useAuth()

  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const limit = 10

  const [open, setOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: ""
  })

  const loadAdmins = async () => {
    try {
      setLoading(true)

      const params: any = {
        role: "ADMIN",
        page,
        limit
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const response = await api.get("/users", { params })

      setAdmins(response.data.data || [])
    } catch (error) {
      console.log("Erro ao carregar admins", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [page])

  function openEdit(admin: Admin) {
    setSelectedAdmin(admin)

    setForm({
      name: admin.name,
      email: admin.email,
      password: ""
    })

    setEditOpen(true)
  }

  function openDelete(admin: Admin) {
    setSelectedAdmin(admin)
    setDeleteOpen(true)
  }

  async function updateAdmin() {
    if (!selectedAdmin || saving) return

    if (!form.name || !form.email) {
      alert("Preencha nome e email.")
      return
    }

    try {
      setSaving(true)

      const payload: any = {
        name: form.name,
        email: form.email
      }

      if (form.password) {
        payload.password = form.password
      }

      await api.put(`/users/${selectedAdmin.id}`, payload)

      setEditOpen(false)
      setSelectedAdmin(null)

      await loadAdmins()
    } catch (error) {
      console.log("Erro ao atualizar admin", error)
      alert("Erro ao atualizar administrador.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteAdmin() {
    if (!selectedAdmin || deleting) return

    try {
      setDeleting(true)

      await api.delete(`/users/${selectedAdmin.id}`)

      setDeleteOpen(false)
      setSelectedAdmin(null)

      await loadAdmins()
    } catch (error) {
      console.log("Erro ao excluir admin", error)
      alert("Erro ao excluir administrador.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Administradores</h2>
            <p style={styles.subtitle}>
              Gerencie os administradores vinculados aos municípios.
            </p>
          </div>

          <button style={styles.primaryBtn} onClick={() => setOpen(true)}>
            <Plus size={18} />
            Novo Admin
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleArea}>
              <div style={styles.iconBox}>
                <Shield size={20} />
              </div>

              <div>
                <h3 style={styles.cardTitle}>Admins cadastrados</h3>
                <p style={styles.cardSubtitle}>
                  Página {page} • {admins.length} registro(s)
                </p>
              </div>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Município</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>
                      Carregando administradores...
                    </td>
                  </tr>
                )}

                {!loading && admins.length === 0 && (
                  <tr>
                    <td colSpan={4} style={styles.empty}>
                      Nenhum administrador encontrado
                    </td>
                  </tr>
                )}

                {!loading &&
                  admins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      style={{
                        ...styles.row,
                        background: index % 2 === 0 ? "#fff" : "#fafafa"
                      }}
                    >
                      <td style={styles.td}>
                        <strong style={styles.name}>{admin.name}</strong>
                      </td>

                      <td style={styles.td}>{admin.email}</td>

                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {admin.municipality?.name || "-"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.editBtn}
                            onClick={() => openEdit(admin)}
                          >
                            <Pencil size={15} />
                            Editar
                          </button>

                          <button
                            style={styles.deleteBtn}
                            onClick={() => openDelete(admin)}
                          >
                            <Trash2 size={15} />
                            Excluir
                          </button>
                        </div>
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

            <span style={styles.pageText}>Página {page}</span>

            <button
              disabled={admins.length < limit}
              onClick={() => setPage(page + 1)}
              style={admins.length < limit ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <div style={modal.overlay}>
          <div style={modal.container}>
            <h3 style={modal.title}>Editar Administrador</h3>

            <label style={modal.label}>Nome</label>
            <input
              style={modal.input}
              value={form.name}
              placeholder="Nome"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label style={modal.label}>Email</label>
            <input
              style={modal.input}
              value={form.email}
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label style={modal.label}>Nova senha</label>
            <input
              type="password"
              style={modal.input}
              placeholder="Opcional"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div style={modal.actions}>
              <button
                style={modal.cancel}
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                style={saving ? modal.saveDisabled : modal.save}
                onClick={updateAdmin}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div style={modal.overlay}>
          <div style={modal.container}>
            <h3 style={modal.title}>Excluir Administrador</h3>

            <p style={modal.text}>
              Deseja realmente excluir o administrador{" "}
              <strong>{selectedAdmin?.name}</strong>?
            </p>

            <div style={modal.actions}>
              <button
                style={modal.cancel}
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                style={deleting ? modal.deleteDisabled : modal.delete}
                onClick={deleteAdmin}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateAdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={loadAdmins}
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

  badge: {
    display: "inline-block",
    background: "#fdf2f8",
    color: "#be185d",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800
  },

  empty: {
    padding: 28,
    textAlign: "center",
    color: "#9ca3af",
    fontWeight: 700
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },

  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800
  },

  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
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

const modal: any = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 16
  },

  container: {
    background: "#fff",
    padding: 26,
    borderRadius: 14,
    width: "100%",
    maxWidth: 430,
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
  },

  title: {
    margin: "0 0 18px",
    color: "#111827",
    fontSize: 20,
    fontWeight: 800
  },

  label: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 9,
    marginBottom: 12,
    outline: "none"
  },

  text: {
    margin: "0 0 20px",
    color: "#374151",
    lineHeight: 1.5
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap"
  },

  cancel: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  save: {
    padding: "10px 14px",
    border: "none",
    background: "#ec4899",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  saveDisabled: {
    padding: "10px 14px",
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 800
  },

  delete: {
    padding: "10px 14px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  deleteDisabled: {
    padding: "10px 14px",
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 800
  }
}
