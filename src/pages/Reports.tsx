/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import {
  ClipboardList,
  FileText,
  Filter,
  MapPinned,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  Users
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

type ReportType =
  | "women"
  | "demographics"
  | "emergencies"
  | "visitsWomen"
  | "visitsAuthors"
  | "violenceTypes"
  | "police"
  | "municipalities"

const reportOptions = [
  { value: "women", label: "Mulheres por município" },
  { value: "demographics", label: "Perfil das mulheres" },
  { value: "emergencies", label: "Pedidos de ajuda" },
  { value: "visitsWomen", label: "Visitas de mulheres" },
  { value: "visitsAuthors", label: "Visitas de autores" },
  { value: "violenceTypes", label: "Tipos de violência" },
  { value: "police", label: "Atendimentos por policial" },
  { value: "municipalities", label: "Municípios" }
]

export default function Reports() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [activeReport, setActiveReport] = useState<ReportType>("women")
  const [municipalityId, setMunicipalityId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")

  const [women, setWomen] = useState<any[]>([])
  const [emergencies, setEmergencies] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [authorVisits, setAuthorVisits] = useState<any[]>([])
  const [municipalities, setMunicipalities] = useState<any[]>([])

  useEffect(() => {
    loadReports()
  }, [user])

  async function loadReports() {
    try {
      setLoading(true)

      const params = buildScopeParams()

      const [
        womenRes,
        emergenciesRes,
        appointmentsRes,
        followupsRes,
        municipalitiesRes,
        authorVisitsRes
      ] = await Promise.all([
        api.get("/users", { params: { role: "WOMAN", all: true, limit: 9999, includeInactive: true, ...params } }),
        api.get("/emergencies", { params: { limit: 9999, ...params } }),
        api.get("/appointment/atendimentos", { params }).catch(() => ({ data: [] })),
        api.get("/appointment/acompanhamentos", { params }).catch(() => ({ data: [] })),
        api.get("/municipalities", { params: { limit: 9999 } }),
        loadAuthorVisits(params)
      ])

      setWomen(applyScope(normalizeList(womenRes.data)))
      setEmergencies(applyScope(normalizeList(emergenciesRes.data)))
      setAppointments(applyScope(normalizeList(appointmentsRes.data)))
      setFollowups(applyScope(normalizeList(followupsRes.data)))
      setAuthorVisits(applyScope(normalizeList(authorVisitsRes.data)))
      setMunicipalities(scopeMunicipalities(normalizeList(municipalitiesRes.data)))
    } finally {
      setLoading(false)
    }
  }

  async function loadAuthorVisits(params: any) {
    try {
      return await api.get("/appointment/author-orientations", { params })
    } catch {
      return await api.get("/appointment/orientacoes-autor", { params }).catch(() => ({ data: [] }))
    }
  }

  function buildScopeParams() {
    const params: any = {}

    if (user?.role !== "SUPER_ADMIN") {
      params.municipalityId = user?.municipalityId
      params.unidadeId = user?.unidadeId
    }

    return params
  }

  function normalizeList(response: any) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    return []
  }

  function scopeMunicipalities(items: any[]) {
    if (user?.role === "SUPER_ADMIN") return items
    return items.filter((item) => item.id === user?.municipalityId)
  }

  function applyScope(items: any[]) {
    if (user?.role === "SUPER_ADMIN") return items

    return items.filter((item) => {
      const itemMunicipalityId = getMunicipalityId(item)
      const itemUnidadeId = getUnidadeId(item)

      const sameMunicipality = !user?.municipalityId || !itemMunicipalityId || itemMunicipalityId === user.municipalityId
      const sameUnit = !user?.unidadeId || !itemUnidadeId || itemUnidadeId === user.unidadeId

      return sameMunicipality && sameUnit
    })
  }

  const currentRows = useMemo(() => {
    if (activeReport === "women") return buildWomenRows()
    if (activeReport === "demographics") return buildDemographicRows()
    if (activeReport === "emergencies") return buildEmergencyRows()
    if (activeReport === "visitsWomen") return buildWomenVisitRows()
    if (activeReport === "visitsAuthors") return buildAuthorVisitRows()
    if (activeReport === "violenceTypes") return buildViolenceRows()
    if (activeReport === "police") return buildPoliceRows()
    return buildMunicipalityRows()
  }, [activeReport, women, emergencies, appointments, followups, authorVisits, municipalities, municipalityId, startDate, endDate, search])

  const summary = useMemo(() => {
    const filteredWomen = filterBase(women, "createdAt")
    const filteredEmergencies = filterBase(emergencies, "createdAt")
    const filteredAppointments = filterBase(appointments, "createdAt")
    const filteredFollowups = filterBase(followups, "createdAt")
    const filteredAuthorVisits = filterBase(authorVisits, "createdAt")

    return [
      { label: "Mulheres", value: filteredWomen.length, color: "#db2777", bg: "#fdf2f8", icon: Users },
      { label: "Pedidos de ajuda", value: filteredEmergencies.length, color: "#dc2626", bg: "#fef2f2", icon: Siren },
      { label: "Visitas de mulheres", value: filteredAppointments.length + filteredFollowups.length, color: "#4f46e5", bg: "#eef2ff", icon: ClipboardList },
      { label: "Visitas de autores", value: filteredAuthorVisits.length, color: "#c2410c", bg: "#fff7ed", icon: ShieldCheck }
    ]
  }, [women, emergencies, appointments, followups, authorVisits, municipalityId, startDate, endDate])

  function filterBase(items: any[], dateField: string) {
    return items.filter((item) => {
      if (municipalityId && getMunicipalityId(item) !== municipalityId) return false
      if (!isInsidePeriod(item[dateField] || item.agenda?.date || item.date)) return false

      const term = search.trim().toLowerCase()
      if (!term) return true

      return stringifyRow(item).includes(term)
    })
  }

  function buildWomenRows() {
    return groupByMunicipality(filterBase(women, "createdAt")).map((item) => ({
      municipio: item.name,
      total: item.total,
      ativas: item.items.filter((w: any) => w.isActive !== false).length,
      inativas: item.items.filter((w: any) => w.isActive === false).length
    }))
  }

  function buildDemographicRows() {
    const grouped: any = {}

    filterBase(women, "createdAt").forEach((item) => {
      const municipio = getMunicipalityName(item)
      const race = item.race || "Não informado"
      const color = item.color || "Não informado"
      const education = item.education || "Não informado"
      const key = `${municipio}|${race}|${color}|${education}`

      if (!grouped[key]) {
        grouped[key] = {
          municipio,
          race,
          color,
          education,
          total: 0,
          ageTotal: 0,
          ageCount: 0
        }
      }

      grouped[key].total++

      if (Number.isFinite(Number(item.age))) {
        grouped[key].ageTotal += Number(item.age)
        grouped[key].ageCount++
      }
    })

    return Object.values(grouped)
      .map((item: any) => ({
        ...item,
        mediaIdade: item.ageCount ? Math.round(item.ageTotal / item.ageCount) : "-"
      }))
      .sort((a: any, b: any) => b.total - a.total)
  }

  function buildEmergencyRows() {
    return groupByMunicipality(filterBase(emergencies, "createdAt")).map((item) => ({
      municipio: item.name,
      total: item.total,
      pendentes: item.items.filter((e: any) => e.status === "PENDING").length,
      emProgresso: item.items.filter((e: any) => e.status === "IN_PROGRESS").length,
      atendidos: item.items.filter((e: any) => e.status === "RESOLVED").length
    }))
  }

  function buildWomenVisitRows() {
    const rows = [
      ...filterBase(appointments, "createdAt").map((item) => ({
        tipo: "Acolhimento",
        assistida: item.nome || item.agenda?.woman?.name || "-",
        municipio: getMunicipalityName(item),
        data: formatDateTime(item.createdAt || item.dataVisita || item.agenda?.date),
        policial: formatPolice(item),
        violencia: item.tipoViolencia?.join(", ") || "-"
      })),
      ...filterBase(followups, "createdAt").map((item) => ({
        tipo: "Acompanhamento",
        assistida: item.nome || item.agenda?.woman?.name || "-",
        municipio: getMunicipalityName(item),
        data: formatDateTime(item.createdAt || item.dataAtendimento || item.agenda?.date),
        policial: formatPolice(item),
        violencia: item.tipoAtendimento || "-"
      }))
    ]

    return rows.sort((a, b) => compareDateText(b.data, a.data))
  }

  function buildAuthorVisitRows() {
    return filterBase(authorVisits, "createdAt").map((item) => ({
      autor: item.nome || item.author?.name || item.agenda?.author?.name || "-",
      municipio: getMunicipalityName(item),
      data: formatDateTime(item.createdAt || item.dataVisita || item.agenda?.date),
      policial: formatPolice(item),
      mpu: item.mpu || "-",
      cienteMedida: item.cienteMedidaProtetiva || "-"
    }))
  }

  function buildViolenceRows() {
    const count: any = {}

    filterBase(appointments, "createdAt").forEach((item) => {
      const values = item.tipoViolencia?.length ? item.tipoViolencia : ["Não informado"]
      values.forEach((value: string) => {
        count[value] = (count[value] || 0) + 1
      })
    })

    return Object.keys(count)
      .map((tipo) => ({ tipo, total: count[tipo] }))
      .sort((a, b) => b.total - a.total)
  }

  function buildPoliceRows() {
    const count: any = {}

    ;[...filterBase(appointments, "createdAt"), ...filterBase(followups, "createdAt"), ...filterBase(authorVisits, "createdAt")].forEach((item) => {
      const police = formatPolice(item)
      count[police] = (count[police] || 0) + 1
    })

    return Object.keys(count)
      .map((policial) => ({ policial, total: count[policial] }))
      .sort((a, b) => b.total - a.total)
  }

  function buildMunicipalityRows() {
    return municipalities
      .filter((item) => !municipalityId || item.id === municipalityId)
      .filter((item) => stringifyRow(item).includes(search.trim().toLowerCase()))
      .map((item) => ({
        municipio: item.name || "-",
        mulheres: women.filter((w) => getMunicipalityId(w) === item.id).length,
        pedidos: emergencies.filter((e) => getMunicipalityId(e) === item.id).length,
        visitasMulheres: [...appointments, ...followups].filter((v) => getMunicipalityId(v) === item.id).length,
        visitasAutores: authorVisits.filter((v) => getMunicipalityId(v) === item.id).length
      }))
  }

  function groupByMunicipality(items: any[]) {
    const grouped: any = {}

    items.forEach((item) => {
      const name = getMunicipalityName(item)
      if (!grouped[name]) grouped[name] = { name, total: 0, items: [] }
      grouped[name].total++
      grouped[name].items.push(item)
    })

    return Object.values(grouped).sort((a: any, b: any) => b.total - a.total) as any[]
  }

  function isInsidePeriod(value?: string) {
    if (!value) return true

    const current = new Date(value).getTime()
    if (Number.isNaN(current)) return true

    if (startDate && current < new Date(`${startDate}T00:00:00`).getTime()) return false
    if (endDate && current > new Date(`${endDate}T23:59:59`).getTime()) return false

    return true
  }

  function getMunicipalityId(item: any) {
    return (
      item.municipalityId ||
      item.municipality?.id ||
      item.user?.municipalityId ||
      item.user?.municipality?.id ||
      item.agenda?.municipalityId ||
      item.agenda?.municipality?.id ||
      item.agenda?.woman?.municipalityId ||
      item.agenda?.woman?.municipality?.id
    )
  }

  function getUnidadeId(item: any) {
    return item.unidadeId || item.unidade?.id || item.agenda?.unidadeId || item.agenda?.unidade?.id
  }

  function getMunicipalityName(item: any) {
    return (
      item.municipality?.name ||
      item.user?.municipality?.name ||
      item.agenda?.municipality?.name ||
      item.agenda?.woman?.municipality?.name ||
      "Sem município"
    )
  }

  function stringifyRow(item: any) {
    return JSON.stringify(item || {}).toLowerCase()
  }

  function formatDateTime(value?: string) {
    return value ? new Date(value).toLocaleString("pt-BR") : "-"
  }

  function compareDateText(a: string, b: string) {
    return new Date(a).getTime() - new Date(b).getTime()
  }

  function formatPolice(item: any) {
    return `${item.police?.graduacao?.name || ""} ${item.police?.user?.name || ""}`.trim() || "-"
  }

  function getColumns() {
    if (activeReport === "women") return ["Município", "Total", "Ativas", "Inativas"]
    if (activeReport === "demographics") return ["Município", "Raça", "Cor", "Escolaridade", "Total", "Média idade"]
    if (activeReport === "emergencies") return ["Município", "Total", "Pendentes", "Em progresso", "Atendidos"]
    if (activeReport === "visitsWomen") return ["Tipo", "Assistida", "Município", "Data", "Policial", "Violência/Atendimento"]
    if (activeReport === "visitsAuthors") return ["Autor", "Município", "Data", "Policial", "MPU", "Medida protetiva"]
    if (activeReport === "violenceTypes") return ["Tipo de violência", "Total"]
    if (activeReport === "police") return ["Policial", "Total"]
    return ["Município", "Mulheres", "Pedidos", "Visitas mulheres", "Visitas autores"]
  }

  function getRowValues(row: any) {
    if (activeReport === "women") return [row.municipio, row.total, row.ativas, row.inativas]
    if (activeReport === "demographics") return [row.municipio, row.race, row.color, row.education, row.total, row.mediaIdade]
    if (activeReport === "emergencies") return [row.municipio, row.total, row.pendentes, row.emProgresso, row.atendidos]
    if (activeReport === "visitsWomen") return [row.tipo, row.assistida, row.municipio, row.data, row.policial, row.violencia]
    if (activeReport === "visitsAuthors") return [row.autor, row.municipio, row.data, row.policial, row.mpu, row.cienteMedida]
    if (activeReport === "violenceTypes") return [row.tipo, row.total]
    if (activeReport === "police") return [row.policial, row.total]
    return [row.municipio, row.mulheres, row.pedidos, row.visitasMulheres, row.visitasAutores]
  }

  function openPdf(doc: jsPDF) {
    const blob = doc.output("blob")
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  function tableTheme() {
    return {
      theme: "grid" as const,
      headStyles: {
        fillColor: [236, 72, 153] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: "bold" as const,
        halign: "center" as const
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak" as const
      },
      margin: { left: 14, right: 14 }
    }
  }

  function header(doc: jsPDF, title: string) {
    doc.setFontSize(16)
    doc.text(title, 14, 18)

    doc.setFontSize(10)
    doc.text("SOS MARIA", 14, 26)
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)
  }

  function gerarPdfDaTela() {
    const doc = new jsPDF()
    const label = reportOptions.find((item) => item.value === activeReport)?.label || "Relatório"

    header(doc, label)
    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [getColumns()],
      body: currentRows.map(getRowValues)
    })

    openPdf(doc)
  }

  async function gerarRelatorioMulheres() {
    const doc = new jsPDF()
    header(doc, "Relatório de Mulheres Cadastradas")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Nome", "CPF", "Idade", "Raça", "Cor", "Escolaridade", "Telefone", "Município", "Endereço"]],
      body: filterBase(women, "createdAt").map((m: any) => [
        m.name || "-",
        m.cpf || "-",
        m.age || "-",
        m.race || "-",
        m.color || "-",
        m.education || "-",
        m.phone || "-",
        m.municipality?.name || "-",
        m.address || "-"
      ])
    })

    openPdf(doc)
  }

  async function gerarRelatorioEmergencias() {
    const doc = new jsPDF()
    header(doc, "Relatório de Emergências")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Assistida", "Município", "Status", "Data", "Telefone"]],
      body: filterBase(emergencies, "createdAt").map((e: any) => [
        e.user?.name || "-",
        e.user?.municipality?.name || "-",
        traduzirStatus(e.status),
        e.createdAt ? new Date(e.createdAt).toLocaleString("pt-BR") : "-",
        e.user?.phone || "-"
      ])
    })

    openPdf(doc)
  }

  async function gerarRelatorioMunicipios() {
    const doc = new jsPDF()
    header(doc, "Relatório por Município")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Município", "Data de cadastro"]],
      body: municipalities.map((m: any) => [
        m.name || "-",
        m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR") : "-"
      ])
    })

    openPdf(doc)
  }

  async function gerarRelatorioAtendimentos() {
    const doc = new jsPDF()
    header(doc, "Relatório de Atendimentos")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Assistida", "Militar", "Violência", "Data", "Município"]],
      body: filterBase(appointments, "createdAt").map((a: any) => [
        a.nome || a.agenda?.woman?.name || "-",
        formatPolice(a),
        a.tipoViolencia?.join(", ") || "-",
        a.createdAt ? new Date(a.createdAt).toLocaleString("pt-BR") : "-",
        a.agenda?.municipality?.name || "-"
      ])
    })

    openPdf(doc)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Relatórios</h2>
          <p style={styles.subtitle}>
            Consulte indicadores na tela e gere PDFs por perfil, município, unidade e período.
          </p>
        </div>

        <button style={styles.refreshBtn} onClick={loadReports} disabled={loading}>
          <RefreshCw size={17} />
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>

      <div style={styles.summaryGrid}>
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <div style={styles.filters}>
        <div style={styles.filterTitle}>
          <Filter size={18} />
          Filtros
        </div>

        <select style={styles.input} value={activeReport} onChange={(e) => setActiveReport(e.target.value as ReportType)}>
          {reportOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select style={styles.input} value={municipalityId} onChange={(e) => setMunicipalityId(e.target.value)}>
          <option value="">Todos os municípios</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
          ))}
        </select>

        <input style={styles.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input style={styles.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            style={styles.searchInput}
            placeholder="Buscar nos dados"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button style={styles.pdfBtn} onClick={gerarPdfDaTela}>
          <FileText size={16} />
          PDF da consulta
        </button>
      </div>

      <div style={styles.reportCard}>
        <div style={styles.reportHeader}>
          <div>
            <h3 style={styles.reportTitle}>
              {reportOptions.find((item) => item.value === activeReport)?.label}
            </h3>
            <p style={styles.reportSubtitle}>
              {currentRows.length} registro(s) encontrado(s)
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {getColumns().map((column) => (
                  <th key={column} style={styles.th}>{column}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td style={styles.empty} colSpan={getColumns().length}>
                    Nenhum dado encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                currentRows.map((row, index) => (
                  <tr key={index} style={styles.row}>
                    {getRowValues(row).map((value, valueIndex) => (
                      <td key={valueIndex} style={styles.td}>{value}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.pdfGrid}>
        <ReportCard
          icon={Users}
          title="Mulheres cadastradas"
          description="Lista completa filtrada por município e período."
          color="#ec4899"
          bg="#fdf2f8"
          onClick={gerarRelatorioMulheres}
        />

        <ReportCard
          icon={Siren}
          title="Emergências"
          description="Pedidos de ajuda, status, município, telefone e data."
          color="#ef4444"
          bg="#fef2f2"
          onClick={gerarRelatorioEmergencias}
        />

        <ReportCard
          icon={MapPinned}
          title="Municípios"
          description="Relação dos municípios visíveis ao seu perfil."
          color="#10b981"
          bg="#ecfdf5"
          onClick={gerarRelatorioMunicipios}
        />

        <ReportCard
          icon={ClipboardList}
          title="Atendimentos"
          description="Acolhimentos realizados, violência e policial responsável."
          color="#6366f1"
          bg="#eef2ff"
          onClick={gerarRelatorioAtendimentos}
        />
      </div>
    </div>
  )
}

function traduzirStatus(status: string) {
  if (status === "PENDING") return "Pendente"
  if (status === "IN_PROGRESS") return "Em progresso"
  if (status === "RESOLVED") return "Atendido"
  return status || "-"
}

function SummaryCard({ label, value, color, bg, icon: Icon }: any) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, background: bg, color }}>
        <Icon size={21} />
      </div>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={{ ...styles.summaryValue, color }}>{value}</strong>
    </div>
  )
}

function ReportCard({ icon: Icon, title, description, color, bg, onClick }: any) {
  return (
    <button style={styles.card} onClick={onClick}>
      <div style={{ ...styles.iconBox, background: bg, color }}>
        <Icon size={22} />
      </div>

      <div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardText}>{description}</p>
      </div>

      <span style={styles.cardAction}>
        <FileText size={16} />
        Gerar PDF
      </span>
    </button>
  )
}

const styles: any = {
  container: {
    width: "100%"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap"
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: 28,
    fontWeight: 800
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 14,
    marginBottom: 18
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)"
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },

  summaryLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 800
  },

  summaryValue: {
    display: "block",
    marginTop: 6,
    fontSize: 28,
    fontWeight: 900
  },

  filters: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: 14,
    padding: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
    marginBottom: 18,
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)"
  },

  filterTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#111827",
    fontWeight: 900
  },

  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#f9fafb",
    color: "#111827"
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "0 10px",
    background: "#f9fafb"
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    padding: "10px 0"
  },

  pdfBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#ec4899",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900
  },

  reportCard: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)"
  },

  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
    flexWrap: "wrap"
  },

  reportTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18,
    fontWeight: 900
  },

  reportSubtitle: {
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
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 13,
    fontWeight: 900,
    borderBottom: "1px solid #e5e7eb"
  },

  row: {
    borderBottom: "1px solid #f1f5f9"
  },

  td: {
    padding: "12px 14px",
    color: "#374151",
    fontSize: 13,
    verticalAlign: "top"
  },

  empty: {
    padding: 26,
    textAlign: "center",
    color: "#9ca3af",
    fontWeight: 800
  },

  pdfGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: 14
  },

  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 14,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 13,
    minHeight: 180
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 16,
    fontWeight: 900
  },

  cardText: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 1.45
  },

  cardAction: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#111827",
    fontSize: 13,
    fontWeight: 900
  }
}
