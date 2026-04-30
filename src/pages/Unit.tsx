/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Building2, Pencil, Plus, Trash2 } from "lucide-react"
import { api } from "../services/api"
import CreateUnidadeModal from "../components/modals/CreateUnidadeModal"

export default function Unidades() {
  const [data, setData] = useState<any[]>([])
  const [municipalities, setMunicipalities] = useState<any[]>([])

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [selectedUnidade, setSelectedUnidade] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    address: "",
    phone: "",
    municipalityId: ""
  })

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

  const loadMunicipalities = async () => {
    try {
      const res = await api.get("/municipalities")
      setMunicipalities(res.data.data || res.data || [])
    } catch (error) {
      console.log("Erro ao carregar municípios", error)
    }
  }

  useEffect(() => {
    load()
    loadMunicipalities()
  }, [])

  function openEdit(unidade: any) {
    setSelectedUnidade(unidade)

    setForm({
      name: unidade.name || "",
      address: unidade.address || "",
      phone: unidade.phone || "",
      municipalityId: unidade.municipalityId || unidade.municipality?.id || ""
    })

    setEditOpen(true)
  }

  function openDelete(unidade: any) {
    setSelectedUnidade(unidade)
    setDeleteOpen(true)
  }

  async function handleUpdate() {
    if (!selectedUnidade || saving) return

    if (!form.name || !form.municipalityId) {
      alert("Informe o nome da unidade e o município.")
      return
    }

    try {
      setSaving(true)

      await api.put(`/unidades/${selectedUnidade.id}`, form)

      setEditOpen(false)
      setSelectedUnidade(null)

      await load()
    } catch (error) {
      console.log("Erro ao atualizar unidade", error)
      alert("Erro ao atualizar unidade.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedUnidade || deleting) return

    try {
      setDeleting(true)

      await api.delete(`/unidades/${selectedUnidade.id}`)

      setDeleteOpen(false)
      setSelectedUnidade(null)

      await load()
    } catch (error) {
      console.log("Erro ao excluir unidade", error)
      alert("Erro ao excluir unidade.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
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
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td style={styles.loadingCell} colSpan={5}>
                      Carregando unidades...
                    </td>
                  </tr>
                )}

                {!loading && data.length === 0 && (
                  <tr>
                    <td style={styles.emptyCell} colSpan={5}>
                      Nenhuma unidade cadastrada
                    </td>
                  </tr>
                )}

                {!loading &&
                  data.map((u: any, index: number) => (
                    <tr
                      key={u.id}
                      style={{
                        ...styles.tr,
                        background: index % 2 === 0 ? "#fff" : "#fafafa"
                      }}
                    >
                      <td style={styles.td}>
                        <strong style={styles.unitName}>{u.name}</strong>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {u.municipality?.name || "Sem município"}
                        </span>
                      </td>

                      <td style={styles.td}>{u.address || "-"}</td>

                      <td style={styles.td}>{u.phone || "-"}</td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.btnEdit}
                            onClick={() => openEdit(u)}
                          >
                            <Pencil size={15} />
                            Editar
                          </button>

                          <button
                            style={styles.btnDelete}
                            onClick={() => openDelete(u)}
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
        </div>

        <CreateUnidadeModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onCreated={load}
        />
      </div>

      {editOpen && (
        <div style={modal.overlay}>
          <div style={modal.container}>
            <h3 style={modal.title}>Editar Unidade</h3>

            <label style={modal.label}>Nome da unidade</label>
            <input
              style={modal.input}
              value={form.name}
              placeholder="Nome"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label style={modal.label}>Endereço</label>
            <input
              style={modal.input}
              value={form.address}
              placeholder="Endereço"
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <label style={modal.label}>Telefone</label>
            <input
              style={modal.input}
              value={form.phone}
              placeholder="Telefone"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label style={modal.label}>Município</label>
            <select
              style={modal.input}
              value={form.municipalityId}
              onChange={(e) => setForm({ ...form, municipalityId: e.target.value })}
            >
              <option value="">Selecione o município</option>

              {municipalities.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

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
                onClick={handleUpdate}
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
            <h3 style={modal.title}>Excluir Unidade</h3>

            <p style={modal.text}>
              Deseja realmente excluir a unidade{" "}
              <strong>{selectedUnidade?.name}</strong>?
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
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
    minWidth: 900,
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

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },

  btnEdit: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12
  },

  btnDelete: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12
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
    maxWidth: 440,
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
    outline: "none",
    background: "#f9fafb"
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
    background: "#10b981",
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
