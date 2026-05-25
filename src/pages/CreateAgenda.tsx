 
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import ActionConfirmModal from "../components/modals/ActionConfirmModal"

export default function AgendaPage() {
  const { user } = useAuth()

  const [agendas, setAgendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(false)

  const [women, setWomen] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [militares, setMilitares] = useState<any[]>([])

  const [targetType, setTargetType] = useState<"WOMAN" | "AUTHOR">("WOMAN")
  const [woman, setWoman] = useState<any>(null)
  const [author, setAuthor] = useState<any>(null)
  const [selectedMilitares, setSelectedMilitares] = useState<any[]>([])

  const [searchWoman, setSearchWoman] = useState("")
  const [searchAuthor, setSearchAuthor] = useState("")
  const [searchPolice, setSearchPolice] = useState("")

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteAgenda, setDeleteAgenda] = useState<any>(null)
  const [deletingAgenda, setDeletingAgenda] = useState(false)
  const [saving, setSaving] = useState(false)


  const [page, setPage] = useState(1)
  const limit = 5

  useEffect(() => {
    loadAgendas()
  }, [])

  useEffect(() => {
    loadAvailablePolice()
  }, [date, time])

  async function loadAgendas() {
    setLoading(true)

    try {
      const res = await api.get("/agenda", {
        params: { unidadeId: user?.unidadeId }
      })

      const sortedAgendas = [...(res.data || [])].sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setAgendas(sortedAgendas)
      setPage(1)
    } catch {
      toast.error("Erro ao carregar escalas")
    } finally {
      setLoading(false)
    }
  }

  async function openModal() {
    setEditingId(null)
    setTargetType("WOMAN")
    setWoman(null)
    setAuthor(null)
    setSelectedMilitares([])
    setSearchWoman("")
    setSearchAuthor("")
    setSearchPolice("")
    setDate("")
    setTime("")
    setMilitares([])
    setModal(true)

    try {
      const [w, a, m] = await Promise.all([
        api.get("/users", { params: { role: "WOMAN", all: true } }),
        api.get("/authors", { params: { all: true, limit: 9999 } }),
        api.get("/police", { params: { unidadeId: user?.unidadeId, all: true  } })
      ])

      setWomen(normalizeList(w.data))
      setAuthors(normalizeList(a.data))
      setMilitares(m.data)
    } catch {
      toast.error("Erro ao carregar dados")
    }
  }

  async function loadAvailablePolice() {
    if (!date || !time) return

    try {
      const fullDate = `${date}T${time}`

      const res = await api.get("/agenda/police/available", {
        params: {
          date: fullDate,
          unidadeId: user?.unidadeId
        }
      })

      setMilitares(res.data)
    } catch {
      toast.error("Erro ao carregar militares disponíveis")
    }
  }

  function toggleMilitar(m: any) {
    const exists = selectedMilitares.find((x) => x.id === m.id)

    if (exists) {
      setSelectedMilitares((prev) => prev.filter((x) => x.id !== m.id))
    } else {
      setSelectedMilitares((prev) => [...prev, m])
    }
  }

  function removeMilitar(id: string) {
    setSelectedMilitares((prev) => prev.filter((m) => m.id !== id))
  }

  function normalizeList(data: any) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  async function handleSubmit() {
  if (saving) return

  if (targetType === "WOMAN" && !woman) {
    toast.warning("Selecione uma assistida")
    return
  }

  if (targetType === "AUTHOR" && !author) {
    toast.warning("Selecione um autor")
    return
  }

  if (!date || !time) {
    toast.warning("Informe data e hora")
    return
  }

  if (selectedMilitares.length === 0) {
    toast.warning("Selecione ao menos um militar")
    return
  }

  setSaving(true)

  try {
    const payload = {
      targetType,
      agendaType: targetType,
      womanId: targetType === "WOMAN" ? woman.id : null,
      authorId: targetType === "AUTHOR" ? author.id : null,
      militares: selectedMilitares.map((m) => m.id),
      policeIds: selectedMilitares.map((m) => m.id),
      date: new Date(`${date}T${time}`)
    }

    if (editingId) {
      await api.put(`/agenda/agenda/${editingId}`, payload)
      toast.success("Escala atualizada")
    } else {
      await api.post("/agenda", payload)
      toast.success("Escala criada")
    }

    setModal(false)
    setEditingId(null)
    setTargetType("WOMAN")
    setSelectedMilitares([])
    setWoman(null)
    setAuthor(null)
    setDate("")
    setTime("")

    loadAgendas()
  } catch {
    toast.error("Erro ao salvar escala")
  } finally {
    setSaving(false)
  }
}

  async function handleDelete(id: string) {
    try {
      setDeletingAgenda(true)
      await api.delete(`/agenda/${id}`)
      toast.success("Escala excluída")
      setDeleteAgenda(null)
      loadAgendas()
    } catch {
      toast.error("Erro ao excluir escala")
    } finally {
      setDeletingAgenda(false)
    }
  }

  async function openEdit(agenda: any) {
    setModal(true)
    setEditingId(agenda.id)
    setSearchWoman("")
    setSearchAuthor("")
    setSearchPolice("")

    try {
      const [w, a, m] = await Promise.all([
        api.get("/users", { params: { role: "WOMAN", all: true } }),
        api.get("/authors", { params: { all: true, limit: 9999 } }),
        api.get("/police", { params: { unidadeId: user?.unidadeId, all: true  } })
      ])

      const loadedAuthors = normalizeList(a.data)

      setWomen(normalizeList(w.data))
      setAuthors(loadedAuthors)
      setMilitares(m.data)
      setTargetType(
        agenda.targetType === "AUTHOR" || agenda.agendaType === "AUTHOR"
          ? "AUTHOR"
          : "WOMAN"
      )
      setWoman(agenda.woman)
      const agendaAuthor = agenda.author || agenda.authorData || agenda.aggressor || agenda.accused || null
      setAuthor(
        agendaAuthor?.id
          ? loadedAuthors.find((item: any) => item.id === agendaAuthor.id) || agendaAuthor
          : null
      )
      setSelectedMilitares(agenda.militares.map((m: any) => m.police))

      const d = new Date(agenda.date)

      setDate(d.toISOString().slice(0, 10))
      setTime(d.toTimeString().slice(0, 5))
    } catch {
      toast.error("Erro ao carregar escala")
    }
  }

  const filteredWomen = women.filter((w: any) =>
    w.name?.toLowerCase().includes(searchWoman.toLowerCase()) ||
    w.cpf?.includes(searchWoman) ||
    w.rg?.includes(searchWoman) ||
    w.phone?.includes(searchWoman)
  )

  const filteredAuthors = authors.filter((a: any) => {
    const term = searchAuthor.toLowerCase()

    return (
      a.nome?.toLowerCase().includes(term) ||
      a.cpf?.includes(searchAuthor) ||
      a.rg?.includes(searchAuthor) ||
      a.telefone?.includes(searchAuthor) ||
      a.woman?.name?.toLowerCase().includes(term) ||
      a.woman?.cpf?.includes(searchAuthor) ||
      a.woman?.municipality?.name?.toLowerCase().includes(term)
    )
  })

  const mergedPolice = [
    ...militares,
    ...selectedMilitares.filter(
      (s) => !militares.find((m) => m.id === s.id)
    )
  ]

  const filteredPolice = mergedPolice.filter((m: any) =>
    m.user?.name?.toLowerCase().includes(searchPolice.toLowerCase()) ||
    m.graduacao?.name?.toLowerCase().includes(searchPolice.toLowerCase())
  )

  const totalPages = Math.ceil(agendas.length / limit)

  const paginatedAgendas = agendas.slice(
    (page - 1) * limit,
    page * limit
  )

  function getAgendaAuthor(agenda: any) {
    return agenda.author || agenda.authorData || agenda.aggressor || agenda.accused || {}
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando escalas...</p>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Escalas</h2>
          <p style={styles.subtitle}>
            Gerencie as visitas, assistidas e militares escalados.
          </p>
        </div>

        <button style={styles.btnPrimary} onClick={openModal}>
          + Criar Escala
        </button>
      </div>

      {agendas.length === 0 ? (
        <div style={styles.emptyBox}>
          <h3 style={styles.emptyTitle}>Nenhuma escala criada</h3>
          <p style={styles.emptyText}>
            Clique em Criar Escala para cadastrar a primeira visita.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.agendaList}>
            {paginatedAgendas.map((a: any) => (
              <div key={a.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <strong style={styles.womanName}>
                      {a.targetType === "AUTHOR" || a.agendaType === "AUTHOR"
                        ? getAgendaAuthor(a).nome || getAgendaAuthor(a).name || "Autor não informado"
                        : a.woman?.name}
                    </strong>

                    <span style={a.targetType === "AUTHOR" || a.agendaType === "AUTHOR" ? styles.authorBadge : styles.womanBadge}>
                      {a.targetType === "AUTHOR" || a.agendaType === "AUTHOR" ? "Autor" : "Assistida"}
                    </span>

                    <p style={styles.infoText}>
                      {a.targetType === "AUTHOR" || a.agendaType === "AUTHOR"
                        ? getAgendaAuthor(a).endereco || getAgendaAuthor(a).address || "Endereço não informado"
                        : a.woman?.address || "Endereço não informado"}
                    </p>

                    {(a.targetType === "AUTHOR" || a.agendaType === "AUTHOR") && (
                      <p style={styles.infoText}>
                        Assistida vinculada: {getAgendaAuthor(a).woman?.name || "Não informada"}
                      </p>
                    )}

                    <p style={styles.infoText}>
                      Contato:{" "}
                      {a.targetType === "AUTHOR" || a.agendaType === "AUTHOR"
                        ? getAgendaAuthor(a).contato || getAgendaAuthor(a).phone || "Não informado"
                        : a.woman?.phone || "Não informado"}
                    </p>
                  </div>

                  <div style={styles.dateBadge}>
                    {new Date(a.date).toLocaleDateString("pt-BR")}
                    <span>
                      {new Date(a.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div style={styles.divider}></div>

                <p style={styles.sectionLabel}>Militares escalados</p>

                <div style={styles.militares}>
                  {a.militares?.length > 0 ? (
                    a.militares.map((m: any) => (
                      <span key={m.id} style={styles.chip}>
                        {m.police?.graduacao?.name} - {m.police?.user?.name}
                      </span>
                    ))
                  ) : (
                    <span style={styles.noPolice}>
                      Nenhum militar vinculado
                    </span>
                  )}
                </div>

                <div style={styles.actions}>
                  <button
                    style={styles.btnEdit}
                    onClick={() => openEdit(a)}
                  >
                    Editar
                  </button>

                  <button
                    style={styles.btnDelete}
                    onClick={() => setDeleteAgenda(a)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={setPage}
          />
        </>
      )}

      {modal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <div>
                <h2 style={modalStyles.title}>
                  {editingId ? "Editar Escala" : "Criar Escala"}
                </h2>
                <p style={modalStyles.subtitle}>
                  Selecione a assistida, defina data e escolha os militares.
                </p>
              </div>

              <button
                style={modalStyles.closeBtn}
                onClick={() => setModal(false)}
              >
                ×
              </button>
            </div>

            <div style={modalStyles.formGrid}>
              <div style={modalStyles.leftColumn}>
                <div style={styles.panel}>
                  <div style={styles.segmented}>
                    <button
                      type="button"
                      style={targetType === "WOMAN" ? styles.segmentActive : styles.segment}
                      onClick={() => {
                        setTargetType("WOMAN")
                        setAuthor(null)
                      }}
                    >
                      Assistida
                    </button>

                    <button
                      type="button"
                      style={targetType === "AUTHOR" ? styles.segmentActive : styles.segment}
                      onClick={() => {
                        setTargetType("AUTHOR")
                        setWoman(null)
                      }}
                    >
                      Autor / Agressor
                    </button>
                  </div>

                  {targetType === "WOMAN" ? (
                  <>
                  <div style={styles.panelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>Assistida</h3>
                      <p style={styles.panelSubtitle}>
                        {filteredWomen.length} resultado(s)
                      </p>
                    </div>

                    {woman && (
                      <button
                        style={styles.clearBtn}
                        onClick={() => setWoman(null)}
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <input
                    placeholder="Buscar por nome, CPF, RG ou telefone"
                    style={styles.search}
                    value={searchWoman}
                    onChange={(e) => setSearchWoman(e.target.value)}
                  />

                  {woman && (
                    <div style={styles.selectedWomanBox}>
                      <strong>{woman.name}</strong>
                      <span>CPF: {woman.cpf || "Não informado"}</span>
                      <span>Contato: {woman.phone || "Não informado"}</span>
                    </div>
                  )}

                  <div style={styles.resultList}>
                    {filteredWomen.length === 0 ? (
                      <p style={styles.emptySmall}>Nenhuma assistida encontrada</p>
                    ) : (
                      filteredWomen.map((w: any) => {
                        const selected = woman?.id === w.id

                        return (
                          <button
                            key={w.id}
                            type="button"
                            style={{
                              ...styles.personOption,
                              ...(selected ? styles.personOptionSelected : {})
                            }}
                            onClick={() => setWoman(w)}
                          >
                            <div>
                              <strong>{w.name}</strong>
                              <span>{w.cpf || "CPF não informado"}</span>
                            </div>

                            <small>{w.phone || "Sem contato"}</small>
                          </button>
                        )
                      })
                    )}
                  </div>
                  </>
                  ) : (
                    <>
                      <div style={styles.panelHeader}>
                        <div>
                          <h3 style={styles.panelTitle}>Autor / Agressor</h3>
                          <p style={styles.panelSubtitle}>
                            Selecione um autor cadastrado para criar a escala.
                          </p>
                        </div>

                        {author && (
                          <button
                            style={styles.clearBtn}
                            onClick={() => setAuthor(null)}
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      <input
                        placeholder="Buscar autor por nome, CPF, RG, telefone ou mulher vinculada"
                        style={styles.search}
                        value={searchAuthor}
                        onChange={(e) => setSearchAuthor(e.target.value)}
                      />

                      {author && (
                        <div style={styles.selectedAuthorBox}>
                          <strong>{author.nome || "Autor sem nome"}</strong>
                          <div style={styles.authorInfoGrid}>
                            <span><b>CPF:</b> {author.cpf || "Não informado"}</span>
                            <span><b>Contato:</b> {author.telefone || "Não informado"}</span>
                            <span><b>Endereço:</b> {author.endereco || "Não informado"}</span>
                            <span><b>Assistida vinculada:</b> {author.woman?.name || "Não informada"}</span>
                            <span><b>Município:</b> {author.woman?.municipality?.name || author.cidade || "Não informado"}</span>
                          </div>
                        </div>
                      )}

                      <div style={styles.resultList}>
                        {filteredAuthors.length === 0 ? (
                          <p style={styles.emptySmall}>Nenhum autor cadastrado encontrado</p>
                        ) : (
                          filteredAuthors.map((item: any) => {
                            const selected = author?.id === item.id

                            return (
                              <button
                                key={item.id}
                                type="button"
                                style={{
                                  ...styles.personOption,
                                  ...(selected ? styles.personOptionSelected : {})
                                }}
                                onClick={() => setAuthor(item)}
                              >
                                <div>
                                  <strong>{item.nome}</strong>
                                  <span>CPF: {item.cpf || "Não informado"}</span>
                                  <span>
                                    Mulher: {item.woman?.name || "Não informada"}
                                  </span>
                                </div>

                                <small>{selected ? "Selecionado" : "Selecionar"}</small>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={modalStyles.rightColumn}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>Data e hora</h3>
                      <p style={styles.panelSubtitle}>
                        A disponibilidade dos militares usa estes dados.
                      </p>
                    </div>
                  </div>

                  <div style={styles.dateRow}>
                    <input
                      type="date"
                      value={date}
                      style={styles.input}
                      onChange={(e) => setDate(e.target.value)}
                    />

                    <input
                      type="time"
                      value={time}
                      style={styles.input}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>Militares</h3>
                      <p style={styles.panelSubtitle}>
                        {selectedMilitares.length} selecionado(s)
                      </p>
                    </div>

                    {selectedMilitares.length > 0 && (
                      <button
                        style={styles.clearBtn}
                        onClick={() => setSelectedMilitares([])}
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <input
                    placeholder="Buscar por nome ou graduação"
                    style={styles.search}
                    value={searchPolice}
                    onChange={(e) => setSearchPolice(e.target.value)}
                  />

                  {selectedMilitares.length > 0 && (
                    <div style={styles.selectedPoliceArea}>
                      {selectedMilitares.map((m: any) => (
                        <button
                          key={m.id}
                          type="button"
                          style={styles.selectedPoliceChip}
                          onClick={() => removeMilitar(m.id)}
                        >
                          {m.graduacao?.name} - {m.user?.nomeDeGuerra} ×
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={styles.policeResultList}>
                    {filteredPolice.length === 0 ? (
                      <p style={styles.emptySmall}>
                        Nenhum militar disponível para esta data e horário
                      </p>
                    ) : (
                      filteredPolice.map((m: any) => {
                        const selected = selectedMilitares.find((x) => x.id === m.id)

                        return (
                          <button
                            key={m.id}
                            type="button"
                            style={{
                              ...styles.policeOption,
                              ...(selected ? styles.policeOptionSelected : {})
                            }}
                            onClick={() => toggleMilitar(m)}
                          >
                            <div>
                              <span>{m.graduacao?.name || "Graduação não informada"}</span> - 
                              <strong>{m.user?.nomeDeGuerra}</strong> 
                            </div>

                            <small>
                              {selected ? "Selecionado" : "Selecionar"}
                            </small>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={modalStyles.actions}>
              <button
                style={styles.btnCancel}
                onClick={() => setModal(false)}
              >
                Cancelar
              </button>

              <button
  style={saving ? styles.btnDisabled : styles.btnPrimary}
  onClick={handleSubmit}
  disabled={saving}
>
  {saving
    ? "Salvando..."
    : editingId
      ? "Atualizar Escala"
      : "Criar Escala"}
</button>

            </div>
          </div>
        </div>
      )}

      <ActionConfirmModal
        isOpen={Boolean(deleteAgenda)}
        onClose={() => setDeleteAgenda(null)}
        onConfirm={() => deleteAgenda && handleDelete(deleteAgenda.id)}
        title="Excluir escala"
        message="Deseja excluir esta escala?"
        helper="A agenda deixará de aparecer para os militares escalados."
        confirmText="Excluir"
        loading={deletingAgenda}
        variant="danger"
      />
    </div>
  )
}

function Pagination({ totalPages, page, setPage }: any) {
  if (totalPages <= 1) return null

  return (
    <div style={styles.pagination}>
      <button
        style={page === 1 ? styles.pageButtonDisabled : styles.pageButton}
        disabled={page === 1}
        onClick={() => setPage((prev: number) => Math.max(prev - 1, 1))}
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const current = i + 1

        return (
          <button
            key={current}
            style={page === current ? styles.pageActive : styles.pageNumber}
            onClick={() => setPage(current)}
          >
            {current}
          </button>
        )
      })}

      <button
        style={page === totalPages ? styles.pageButtonDisabled : styles.pageButton}
        disabled={page === totalPages}
        onClick={() => setPage((prev: number) => Math.min(prev + 1, totalPages))}
      >
        Próxima
      </button>
    </div>
  )
}

const styles: any = {
  container: {
    padding: 30,
    maxWidth: "100%",
    margin: "0 auto"
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
    color: "#111827"
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280"
  },

  btnPrimary: {
    background: "linear-gradient(135deg,#8e24aa,#ec4899)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer"
  },

  btnCancel: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer"
  },

  agendaList: {
    display: "grid",
    gap: 14
  },

  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    border: "1px solid #eef2f7"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap"
  },

  womanName: {
    display: "block",
    fontSize: 18,
    color: "#111827",
    marginBottom: 6
  },

  womanBadge: {
    display: "inline-block",
    background: "#fdf2f8",
    color: "#be185d",
    border: "1px solid #fbcfe8",
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6
  },

  authorBadge: {
    display: "inline-block",
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fed7aa",
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6
  },

  infoText: {
    margin: "4px 0",
    color: "#6b7280",
    fontSize: 14
  },

  dateBadge: {
    minWidth: 125,
    background: "#fdf2f8",
    color: "#be185d",
    border: "1px solid #fbcfe8",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  divider: {
    height: 1,
    background: "#f1f5f9",
    margin: "14px 0"
  },

  sectionLabel: {
    margin: "0 0 8px",
    fontSize: 13,
    fontWeight: 700,
    color: "#374151"
  },

  militares: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },

  chip: {
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    padding: "6px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600
  },

  noPolice: {
    color: "#9ca3af",
    fontSize: 13
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },

  btnEdit: {
    padding: "9px 14px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: 700
  },

  btnDelete: {
    padding: "9px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: 700
  },

  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#fff"
  },

  segmented: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 14
  },

  segment: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    borderRadius: 10,
    padding: "10px",
    cursor: "pointer",
    fontWeight: 800
  },

  segmentActive: {
    border: "1px solid #ec4899",
    background: "#fdf2f8",
    color: "#be185d",
    borderRadius: 10,
    padding: "10px",
    cursor: "pointer",
    fontWeight: 900
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10
  },

  panelTitle: {
    margin: 0,
    fontSize: 16,
    color: "#111827"
  },

  panelSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 12
  },

  clearBtn: {
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    borderRadius: 8,
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 700
  },

  search: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    marginBottom: 10,
    outline: "none"
  },

  resultList: {
    maxHeight: 360,
    overflowY: "auto",
    display: "grid",
    gap: 8,
    paddingRight: 4
  },

  policeResultList: {
    maxHeight: 300,
    overflowY: "auto",
    display: "grid",
    gap: 8,
    paddingRight: 4
  },

  personOption: {
    width: "100%",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    textAlign: "left"
  },

  personOptionSelected: {
    border: "2px solid #ec4899",
    background: "#fdf2f8"
  },

  selectedWomanBox: {
    border: "1px solid #f9a8d4",
    background: "#fdf2f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#831843"
  },

  selectedAuthorBox: {
    border: "1px solid #fed7aa",
    background: "#fff7ed",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#9a3412"
  },

  authorInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px 14px",
    marginTop: 8,
    lineHeight: 1.45
  },

  authorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 10,
    marginBottom: 14
  },

  linkedWomanBox: {
    borderTop: "1px solid #f1f5f9",
    paddingTop: 14
  },

  selectedPoliceArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },

  selectedPoliceChip: {
    border: "none",
    background: "#eef2ff",
    color: "#3730a3",
    borderRadius: 999,
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12
  },

  policeOption: {
    width: "100%",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    textAlign: "left"
  },

  policeOptionSelected: {
    border: "2px solid #6366f1",
    background: "#eef2ff"
  },

  dateRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },

  input: {
    flex: 1,
    minWidth: 180,
    padding: "10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb"
  },

  emptyBox: {
    background: "#fff",
    border: "1px dashed #d1d5db",
    borderRadius: 16,
    padding: 35,
    textAlign: "center",
    color: "#6b7280"
  },

  emptyTitle: {
    color: "#111827",
    marginBottom: 8
  },

  emptyText: {
    margin: 0
  },

  emptySmall: {
    color: "#9ca3af",
    padding: 12,
    margin: 0
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    flexWrap: "wrap"
  },

  pageButton: {
    padding: "9px 13px",
    background: "#8e24aa",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700
  },

  pageButtonDisabled: {
    padding: "9px 13px",
    background: "#e5e7eb",
    color: "#9ca3af",
    border: "none",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 700
  },

  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 700
  },

  pageActive: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    background: "#ec4899",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    background: "#fafafa"
  },

  spinner: {
    width: 48,
    height: 48,
    border: "5px solid #eee",
    borderTop: "5px solid #ec4899",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },

  loadingText: {
    color: "#8e24aa",
    fontSize: 16,
    fontWeight: 700
  }
}

const modalStyles: any = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 16
  },

  modal: {
    width: "100%",
    maxWidth: 1120,
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },

  title: {
    margin: 0,
    color: "#111827"
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: "24px"
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 0.9fr) minmax(360px, 1.1fr)",
    gap: 16
  },

  leftColumn: {
    minWidth: 0
  },

  rightColumn: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap"
  },

  btnDisabled: {
  background: "#d1d5db",
  color: "#6b7280",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "not-allowed"
},

}
