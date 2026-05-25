/* eslint-disable @typescript-eslint/no-explicit-any */

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { FileText, Pencil, Plus, Search, Trash2, UserRoundCheck, X } from "lucide-react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import ActionConfirmModal from "../components/modals/ActionConfirmModal"

type AuthorForm = {
  id?: string
  nome: string
  cpf: string
  rg: string
  telefone: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  observacoes: string
  womanId: string
}

const emptyForm: AuthorForm = {
  nome: "",
  cpf: "",
  rg: "",
  telefone: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "Pará",
  observacoes: "",
  womanId: ""
}

export default function Authors() {
  const { user } = useAuth()

  const [authors, setAuthors] = useState<any[]>([])
  const [women, setWomen] = useState<any[]>([])
  const [form, setForm] = useState<AuthorForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [womanSearch, setWomanSearch] = useState("")
  const [page, setPage] = useState(1)

  const limit = 10
  const isEditing = Boolean(form.id)

  async function loadData() {
    try {
      setLoading(true)

      const params: any = {
        role: "WOMAN",
        all: true,
        limit: 9999,
        includeInactive: true
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const [authorsResponse, womenResponse] = await Promise.allSettled([
        api.get("/authors", { params: { all: true, limit: 9999 } }),
        api.get("/users", { params })
      ])

      if (authorsResponse.status === "fulfilled") {
        setAuthors(normalizeList(authorsResponse.value.data))
      } else {
        console.log("Erro ao carregar lista de autores", authorsResponse.reason)
        toast.error("Erro ao carregar lista de autores.")
      }

      if (womenResponse.status === "fulfilled") {
        setWomen(normalizeList(womenResponse.value.data))
      } else {
        console.log("Erro ao carregar mulheres para vínculo", womenResponse.reason)
        toast.error("Erro ao carregar mulheres para vínculo.")
      }
    } catch (error) {
      console.log("Erro ao carregar autores", error)
      toast.error("Erro ao carregar autores.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filteredAuthors = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return authors

    return authors.filter((author) =>
      [
        author.nome,
        author.cpf,
        author.rg,
        author.telefone,
        author.endereco,
        author.bairro,
        author.cidade,
        author.estado,
        author.observacoes,
        author.woman?.name,
        author.woman?.municipality?.name,
        author.woman?.unidade?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [authors, search])

  const paginatedAuthors = useMemo(() => {
    const start = (page - 1) * limit
    return filteredAuthors.slice(start, start + limit)
  }, [filteredAuthors, page])

  const filteredWomen = useMemo(() => {
    const term = womanSearch.trim().toLowerCase()

    if (!term) return women

    return women.filter((woman) =>
      [
        woman.name,
        woman.cpf,
        woman.phone,
        woman.municipality?.name,
        woman.unidade?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [women, womanSearch])

  const womenOptions = useMemo(() => {
    if (!form.womanId) return filteredWomen

    const selectedWoman = women.find((woman) => woman.id === form.womanId)
    const selectedAlreadyVisible = filteredWomen.some((woman) => woman.id === form.womanId)

    if (!selectedWoman || selectedAlreadyVisible) return filteredWomen

    return [selectedWoman, ...filteredWomen]
  }, [filteredWomen, form.womanId, women])

  function normalizeList(data: any) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  function updateField(field: keyof AuthorForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  function clearForm() {
    setForm(emptyForm)
    setWomanSearch("")
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!form.nome.trim()) {
      toast.warning("Informe o nome do autor.")
      return
    }

    if (!form.womanId) {
      toast.warning("Selecione a mulher vinculada ao autor.")
      return
    }

    try {
      setSaving(true)

      const payload = {
        nome: form.nome.trim(),
        cpf: onlyNumbers(form.cpf) || null,
        rg: form.rg.trim() || null,
        telefone: onlyNumbers(form.telefone) || null,
        endereco: form.endereco.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        observacoes: form.observacoes.trim() || null,
        womanId: form.womanId
      }

      if (isEditing) {
        await api.put(`/authors/${form.id}`, payload)
        toast.success("Autor atualizado com sucesso.")
      } else {
        await api.post("/authors", payload)
        toast.success("Autor cadastrado com sucesso.")
      }

      clearForm()
      await loadData()
    } catch (error: any) {
      console.log("Erro ao salvar autor", error)
      toast.error(error?.response?.data?.message || "Erro ao salvar autor.")
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(author: any) {
    setForm({
      id: author.id,
      nome: author.nome || "",
      cpf: author.cpf || "",
      rg: author.rg || "",
      telefone: author.telefone || "",
      endereco: author.endereco || "",
      bairro: author.bairro || "",
      cidade: author.cidade || "",
      estado: author.estado || "Pará",
      observacoes: author.observacoes || "",
      womanId: author.womanId || author.woman?.id || ""
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleDelete(author: any) {
    setSelectedAuthor(author)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!selectedAuthor || deleting) return
    
    try {
      setDeleting(true)
      await api.delete(`/authors/${selectedAuthor.id}`)
      toast.success("Autor excluído com sucesso.")
      setDeleteOpen(false)
      setSelectedAuthor(null)
      await loadData()
    } catch (error) {
      console.log("Erro ao excluir autor", error)
      toast.error("Erro ao excluir autor.")
    } finally {
      setDeleting(false)
    }
  }

  function generatePdf() {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Relatório de Autores Cadastrados", 14, 18)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 26)

    autoTable(doc, {
      startY: 34,
      head: [["Autor", "CPF", "RG", "Telefone", "Mulher vinculada", "Município", "Endereço"]],
      body: filteredAuthors.map((author) => [
        author.nome || "-",
        formatCPF(author.cpf) || "-",
        author.rg || "-",
        formatPhone(author.telefone) || "-",
        author.woman?.name || "-",
        author.woman?.municipality?.name || author.cidade || "-",
        [author.endereco, author.bairro, author.cidade, author.estado].filter(Boolean).join(", ") || "-"
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: "linebreak"
      }
    })

    const url = URL.createObjectURL(doc.output("blob"))
    window.open(url, "_blank")
  }

  function onlyNumbers(value?: string) {
    return (value || "").replace(/\D/g, "")
  }

  function formatCPF(value?: string) {
    const numbers = onlyNumbers(value)

    return numbers
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14)
  }

  function formatPhone(value?: string) {
    const numbers = onlyNumbers(value)

    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14)
    }

    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Cadastro do Autor</h2>
            <p style={styles.subtitle}>
              Cadastre autores/acusados e vincule cada registro à mulher assistida.
            </p>
          </div>

          <button style={styles.pdfBtn} onClick={generatePdf}>
            <FileText size={18} />
            PDF
          </button>
        </div>

        <form style={styles.formCard} onSubmit={handleSubmit}>
        <div style={styles.formHeader}>
          <div style={styles.iconBox}>
            <UserRoundCheck size={21} />
          </div>

          <div>
            <h3 style={styles.cardTitle}>{isEditing ? "Editar autor" : "Novo autor"}</h3>
            <p style={styles.cardSubtitle}>Dados de identificação, contato e vínculo com a assistida.</p>
          </div>
        </div>

        <div style={styles.grid}>
          <Field label="Nome do autor" value={form.nome} onChange={(value) => updateField("nome", value)} required />
          <Field label="CPF" value={formatCPF(form.cpf)} onChange={(value) => updateField("cpf", value)} />
          <Field label="RG" value={form.rg} onChange={(value) => updateField("rg", value)} />
          <Field label="Telefone" value={formatPhone(form.telefone)} onChange={(value) => updateField("telefone", value)} />

          <label style={{ ...styles.label, ...styles.womanField }}>
            Buscar mulher
            <div style={styles.searchBoxWide}>
              <Search size={18} color="#9ca3af" />
              <input
                value={womanSearch}
                onChange={(event) => setWomanSearch(event.target.value)}
                placeholder="Digite nome, CPF, telefone ou município"
                style={styles.searchInput}
              />
            </div>
            <span style={styles.helperText}>
              {women.length === 0
                ? "Nenhuma mulher carregada."
                : `${filteredWomen.length} de ${women.length} mulher(es) encontrada(s).`}
            </span>
          </label>

          <label style={{ ...styles.label, ...styles.womanField }}>
            Mulher vinculada
            <select
              value={form.womanId}
              onChange={(event) => updateField("womanId", event.target.value)}
              style={styles.input}
              required
            >
              <option value="">Selecione a mulher</option>
              {womenOptions.map((woman) => (
                <option key={woman.id} value={woman.id}>
                  {woman.name} - {formatCPF(woman.cpf) || "CPF não informado"} - {woman.municipality?.name || "Município não informado"}
                </option>
              ))}
              {women.length > 0 && womenOptions.length === 0 && (
                <option value="" disabled>
                  Nenhuma mulher encontrada na busca
                </option>
              )}
            </select>
          </label>

          <Field label="Endereço" value={form.endereco} onChange={(value) => updateField("endereco", value)} />
          <Field label="Bairro" value={form.bairro} onChange={(value) => updateField("bairro", value)} />
          <Field label="Cidade" value={form.cidade} onChange={(value) => updateField("cidade", value)} />
          <Field label="Estado" value={form.estado} onChange={(value) => updateField("estado", value)} />

          <label style={{ ...styles.label, ...styles.full }}>
            Observações
            <textarea
              value={form.observacoes}
              onChange={(event) => updateField("observacoes", event.target.value)}
              style={{ ...styles.input, minHeight: 84, resize: "vertical" }}
            />
          </label>
        </div>

        <div style={styles.formActions}>
          {isEditing && (
            <button type="button" style={styles.cancelBtn} onClick={clearForm}>
              <X size={17} />
              Cancelar edição
            </button>
          )}

          <button type="submit" style={styles.primaryBtn} disabled={saving}>
            <Plus size={17} />
            {saving ? "Salvando..." : isEditing ? "Atualizar autor" : "Cadastrar autor"}
          </button>
        </div>
        </form>

        <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Autores cadastrados</h3>
            <p style={styles.cardSubtitle}>
              Página {page} • {filteredAuthors.length} registro(s)
            </p>
          </div>

          <div style={styles.searchBox}>
            <Search size={18} color="#9ca3af" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por autor, mulher, CPF, telefone ou município"
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Autor</th>
                <th style={styles.th}>CPF</th>
                <th style={styles.th}>Telefone</th>
                <th style={styles.th}>Mulher vinculada</th>
                <th style={styles.th}>Município</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={styles.empty}>Carregando autores...</td>
                </tr>
              )}

              {!loading && filteredAuthors.length === 0 && (
                <tr>
                  <td colSpan={6} style={styles.empty}>Nenhum autor cadastrado</td>
                </tr>
              )}

              {!loading && paginatedAuthors.map((author, index) => (
                <tr key={author.id} style={{ background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={styles.td}>
                    <strong>{author.nome || "-"}</strong>
                    {author.rg && <small style={styles.muted}>RG {author.rg}</small>}
                  </td>
                  <td style={styles.td}>{formatCPF(author.cpf) || "-"}</td>
                  <td style={styles.td}>{formatPhone(author.telefone) || "-"}</td>
                  <td style={styles.td}>{author.woman?.name || "-"}</td>
                  <td style={styles.td}>{author.woman?.municipality?.name || author.cidade || "-"}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.editBtn} onClick={() => handleEdit(author)}>
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button style={styles.deleteBtn} onClick={() => handleDelete(author)}>
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
            disabled={page * limit >= filteredAuthors.length}
            onClick={() => setPage(page + 1)}
            style={page * limit >= filteredAuthors.length ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Próxima
          </button>
        </div>
        </div>
      </div>

      <ActionConfirmModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setSelectedAuthor(null)
        }}
        onConfirm={confirmDelete}
        title="Excluir autor"
        message={`Deseja excluir ${selectedAuthor?.nome || "este autor"}?`}
        helper="Essa ação remove o cadastro do autor e as agendas vinculadas a ele."
        confirmText="Excluir"
        loading={deleting}
        variant="danger"
      />
    </>
  )
}

function Field({
  label,
  value,
  onChange,
  required
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <label style={styles.label}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
        required={required}
      />
    </label>
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

  formCard: {
    background: "#fff",
    padding: "clamp(16px, 3vw, 24px)",
    borderRadius: 14,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    marginBottom: 24
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
    gap: 14,
    marginBottom: 16,
    flexWrap: "wrap"
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
    gap: 16
  },

  full: {
    gridColumn: "1 / -1"
  },

  womanField: {
    gridColumn: "1 / -1"
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  },

  input: {
    width: "100%",
    minHeight: 48,
    padding: "13px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    outline: "none",
    color: "#111827",
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box"
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap"
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    border: "none",
    borderRadius: 10,
    background: "#ec4899",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },

  cancelBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    border: "none",
    borderRadius: 10,
    background: "#e5e7eb",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer"
  },

  pdfBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    border: "none",
    borderRadius: 10,
    background: "#6366f1",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },

  searchBox: {
    minWidth: 260,
    flex: "1 1 360px",
    maxWidth: 520,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff"
  },

  searchBoxWide: {
    width: "100%",
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff",
    boxSizing: "border-box"
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#111827",
    background: "transparent"
  },

  helperText: {
    marginTop: -2,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700
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

  td: {
    padding: "14px 16px",
    color: "#374151",
    fontSize: 14,
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top"
  },

  muted: {
    display: "block",
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700
  },

  empty: {
    padding: 28,
    textAlign: "center",
    color: "#9ca3af",
    fontWeight: 700
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
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
