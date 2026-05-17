/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { FileText, Pencil, Plus, Trash2 } from "lucide-react"
import CreatePoliceModal from "../components/modals/CreatePoliceModal"
import EditPoliceModal from "../components/modals/EditPoliceModal"
import ActionConfirmModal from "../components/modals/ActionConfirmModal"

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
  const [totalPolice, setTotalPolice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [page, setPage] = useState(1)
  const limit = 10

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPolice, setSelectedPolice] = useState<any>(null)

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
      setTotalPolice(res.data.total || 0)
    } catch (e) {
      console.log(e)
      toast.error("Erro ao carregar efetivo.")
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

  function handleEdit(policeItem: any) {
    setSelectedPolice(policeItem)
    setEditOpen(true)
  }

  function handleDelete(policeItem: any) {
    setSelectedPolice(policeItem)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!selectedPolice || deleting) return

    try {
      setDeleting(true)
      await api.delete(`/users/${selectedPolice.id}`)
      setDeleteOpen(false)
      setSelectedPolice(null)
      await loadPolice()
      toast.success("Policial excluído da lista ativa.")
    } catch (error) {
      console.log("Erro ao excluir policial", error)
      toast.error("Erro ao excluir policial.")
    } finally {
      setDeleting(false)
    }
  }

  async function generatePdf() {
    try {
      const params: any = {
        role: "POLICE",
        all: true,
        limit: 9999
      }

      if (user?.role !== "SUPER_ADMIN") {
        params.municipalityId = user?.municipalityId
      }

      const res = await api.get("/users", { params })
      const rows = sortPolice(res.data.data || [])

      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Relatório do Efetivo Policial", 14, 18)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 26)

      autoTable(doc, {
        startY: 34,
        head: [["Graduação", "Nome", "Nome de Guerra", "CPF", "Unidade", "Telefone", "Email"]],
        body: rows.map((item: any) => [
          item.policeProfile?.graduacao?.name || "-",
          item.name || "-",
          item.nomeDeGuerra || "-",
          item.cpf || "-",
          item.policeProfile?.unidade?.name || item.unidade?.name || "-",
          item.phone || "-",
          item.email || "-"
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
    } catch (error) {
      console.log("Erro ao gerar PDF do efetivo", error)
      toast.error("Erro ao gerar PDF do efetivo.")
    }
  }

  function sortPolice(items: any[]) {
    return [...items].sort((a: any, b: any) => {
      const gradA = a.policeProfile?.graduacao?.name
      const gradB = b.policeProfile?.graduacao?.name

      const graduationDiff = getGraduacaoPeso(gradA) - getGraduacaoPeso(gradB)
      if (graduationDiff !== 0) return graduationDiff

      return String(a.name || "").localeCompare(String(b.name || ""))
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Efetivo Policial</h2>
          <p style={styles.subtitle}>
            Gerencie os policiais cadastrados, suas unidades e graduações.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.pdfBtn} onClick={generatePdf}>
            <FileText size={18} />
            PDF do efetivo
          </button>

          <button style={styles.primaryBtn} onClick={() => setOpen(true)}>
            <Plus size={18} />
            Novo Policial
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitleRow}>
              <h3 style={styles.cardTitle}>Policiais cadastrados</h3>
              <span style={styles.totalBadge}>{totalPolice}</span>
            </div>
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
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td style={styles.loadingCell} colSpan={6}>
                    Carregando policiais...
                  </td>
                </tr>
              )}

              {!loading && policeOrdenados.length === 0 && (
                <tr>
                  <td style={styles.emptyCell} colSpan={6}>
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

                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button style={styles.editBtn} onClick={() => handleEdit(p)}>
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button style={styles.deleteBtn} onClick={() => handleDelete(p)}>
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

      <EditPoliceModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false)
          setSelectedPolice(null)
        }}
        onUpdated={loadPolice}
        police={selectedPolice}
      />

      <ActionConfirmModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setSelectedPolice(null)
        }}
        onConfirm={confirmDelete}
        title="Excluir policial"
        message={`Deseja excluir ${selectedPolice?.name || "este policial"} da lista ativa?`}
        helper="O cadastro será desativado e deixará de aparecer no efetivo."
        confirmText="Excluir"
        loading={deleting}
        variant="danger"
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

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
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

  pdfBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer"
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
    background: "#eef2ff",
    color: "#3730a3",
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

  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },

  editBtn: {
    display: "inline-flex",
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
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
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
