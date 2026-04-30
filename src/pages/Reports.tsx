/* eslint-disable @typescript-eslint/no-explicit-any */

import { FileText, MapPinned, Siren, Users, ClipboardList } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Reports() {
  const { user } = useAuth()

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
    doc.text(`SOS MARIA`, 14, 26)
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)
  }

  async function gerarRelatorioMulheres() {
    const params: any = { role: "WOMAN", limit: 9999 }

    if (user?.role !== "SUPER_ADMIN") {
      params.municipalityId = user?.municipalityId
    }

    const res = await api.get("/users", { params })
    const mulheres = res.data.data || []

    const doc = new jsPDF()
    header(doc, "Relatório de Mulheres Cadastradas")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Nome", "CPF", "Telefone", "Município", "Endereço"]],
      body: mulheres.map((m: any) => [
        m.name || "-",
        m.cpf || "-",
        m.phone || "-",
        m.municipality?.name || "-",
        m.address || "-"
      ])
    })

    openPdf(doc)
  }

  async function gerarRelatorioEmergencias() {
    const params: any = { limit: 9999 }

    if (user?.role !== "SUPER_ADMIN") {
      params.municipalityId = user?.municipalityId
    }

    const res = await api.get("/emergencies", { params })
    const emergencias = res.data.data || []

    const doc = new jsPDF()
    header(doc, "Relatório de Emergências")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Assistida", "Município", "Status", "Data", "Telefone"]],
      body: emergencias.map((e: any) => [
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
    const res = await api.get("/municipalities", {
      params: { limit: 9999 }
    })

    const municipios = res.data.data || res.data || []

    const doc = new jsPDF()
    header(doc, "Relatório por Município")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Município", "Data de cadastro"]],
      body: municipios.map((m: any) => [
        m.name || "-",
        m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR") : "-"
      ])
    })

    openPdf(doc)
  }

  async function gerarRelatorioAtendimentos() {
    const res = await api.get("/appointment/atendimentos")
    const atendimentos = res.data || []

    const doc = new jsPDF()
    header(doc, "Relatório de Atendimentos")

    autoTable(doc, {
      ...tableTheme(),
      startY: 42,
      head: [["Assistida", "Militar", "Violência", "Data", "Município"]],
      body: atendimentos.map((a: any) => [
        a.nome || a.agenda?.woman?.name || "-",
        `${a.police?.graduacao?.name || ""} ${a.police?.user?.name || ""}`.trim() || "-",
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
            Gere relatórios consolidados em PDF para visualização e impressão.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <ReportCard
          icon={Users}
          title="Mulheres cadastradas"
          description="Lista de assistidas com dados de contato, município e endereço."
          color="#ec4899"
          bg="#fdf2f8"
          onClick={gerarRelatorioMulheres}
        />

        <ReportCard
          icon={Siren}
          title="Emergências"
          description="Pedidos de ajuda, status, município, telefone e data do acionamento."
          color="#ef4444"
          bg="#fef2f2"
          onClick={gerarRelatorioEmergencias}
        />

        <ReportCard
          icon={MapPinned}
          title="Municípios"
          description="Relação de municípios cadastrados no sistema."
          color="#10b981"
          bg="#ecfdf5"
          onClick={gerarRelatorioMunicipios}
        />

        <ReportCard
          icon={ClipboardList}
          title="Atendimentos"
          description="Atendimentos realizados, tipos de violência e policial responsável."
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

function ReportCard({ icon: Icon, title, description, color, bg, onClick }: any) {
  return (
    <button style={styles.card} onClick={onClick}>
      <div style={{ ...styles.iconBox, background: bg, color }}>
        <Icon size={24} />
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
    marginBottom: 24
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 18
  },

  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 210
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
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

  cardText: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.5
  },

  cardAction: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#111827",
    fontSize: 13,
    fontWeight: 800
  }
}
