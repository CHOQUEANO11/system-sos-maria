/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { api } from "../services/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useAuth } from "../context/AuthContext"


export default function AgendaPolicePage() {
  const { user } = useAuth()

  const [data, setData] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  const [atendidos, setAtendidos] = useState<any[]>([])
  const [acompanhamentos, setAcompanhamentos] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  const [busca, setBusca] = useState("")
  const [paginaVisitas, setPaginaVisitas] = useState(1)
  const [paginaAtendimentos, setPaginaAtendimentos] = useState(1)

  const itensPorPagina = 5

  const [modalEscolha, setModalEscolha] = useState(false)
  const [modal, setModal] = useState(false)
  const [modalAcompanhamento, setModalAcompanhamento] = useState(false)
  const [salvandoAtendimento, setSalvandoAtendimento] = useState(false)
  const [salvandoAcompanhamento, setSalvandoAcompanhamento] = useState(false)


  const [form, setForm] = useState<any>({
    parentesco: [],
    tipoViolencia: [],
    descumprimento: []
  })

  const [formAcompanhamento, setFormAcompanhamento] = useState<any>({
    tipoAtendimento: "",
    medidasCumpridas: ""
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)

      await Promise.all([
        load(),
        loadAtendimentos(),
        loadAcompanhamentos()
      ])
    } finally {
      setLoading(false)
    }
  }

  async function load() {
    const res = await api.get("/agenda/police")
    setData(res.data)
  }

  async function loadAtendimentos() {
    try {
      const response = await api.get("/appointment/atendimentos")
      setAtendidos(response.data)
    } catch (error) {
      console.log("Erro ao carregar atendimentos", error)
    }
  }

  async function loadAcompanhamentos() {
    try {
      const response = await api.get("/appointment/acompanhamentos")
      setAcompanhamentos(response.data)
    } catch (error) {
      console.log("Erro ao carregar acompanhamentos", error)
    }
  }

  function getAtendimentoByAgenda(agendaId: string) {
    return atendidos.find((item: any) => item.agendaId === agendaId)
  }

  function getAcompanhamentoByAgenda(agendaId: string) {
    return acompanhamentos.find((item: any) => item.agendaId === agendaId)
  }

  function hasAtendimento(agendaId: string) {
    return Boolean(getAtendimentoByAgenda(agendaId))
  }

  function hasAcompanhamento(agendaId: string) {
    return Boolean(getAcompanhamentoByAgenda(agendaId))
  }

  function isAgendaCompleta(agendaId: string) {
    return hasAtendimento(agendaId) && hasAcompanhamento(agendaId)
  }

  const visitasPendentes = useMemo(() => {
    return data.filter((item: any) => !isAgendaCompleta(item.id))
  }, [data, atendidos, acompanhamentos])

  const visitasFiltradas = useMemo(() => {
    const texto = busca.toLowerCase().trim()

    if (!texto) return visitasPendentes

    return visitasPendentes.filter((item: any) => {
      const atendimentoEnviado = hasAtendimento(item.id)
      const acompanhamentoEnviado = hasAcompanhamento(item.id)

      return [
        item.woman?.name,
        item.woman?.cpf,
        item.woman?.phone,
        item.municipality?.name,
        item.id,
        atendimentoEnviado ? "acolhimento enviado" : "acolhimento pendente",
        acompanhamentoEnviado ? "acompanhamento enviado" : "acompanhamento pendente"
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(texto)
    })
  }, [busca, visitasPendentes, atendidos, acompanhamentos])

  const atendimentosPermitidos = useMemo(() => {
  if (!user) return []

  if (user.role === "SUPER_ADMIN") {
    return atendidos
  }

  if (user.role === "ADMIN") {
    return atendidos.filter((item: any) =>
      item.agenda?.unidadeId === user.unidadeId ||
      item.agenda?.unidade?.id === user.unidadeId
    )
  }

  if (user.role === "POLICE") {
    return atendidos.filter((item: any) =>
      item.agenda?.militares?.some((m: any) =>
        m.police?.userId === user.id ||
        m.police?.user?.id === user.id 
        // m.policeId === user.policeProfile?.id
      )
    )
  }

  return []
}, [atendidos, user])


  const atendimentosFiltrados = useMemo(() => {
  const texto = busca.toLowerCase().trim()

  if (!texto) return atendimentosPermitidos

  return atendimentosPermitidos.filter((item: any) =>
    [
      item.nome,
      item.agenda?.woman?.name,
      item.agenda?.woman?.cpf,
      item.agenda?.woman?.phone,
      item.agenda?.municipality?.name,
      item.agendaId,
      item.police?.user?.name,
      item.police?.graduacao?.name,
      item.tipoViolencia?.join(" ")
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(texto)
  )
}, [busca, atendimentosPermitidos])


  const totalPaginasVisitas = Math.ceil(visitasFiltradas.length / itensPorPagina) || 1
  const totalPaginasAtendimentos = Math.ceil(atendimentosFiltrados.length / itensPorPagina) || 1

  const visitasPaginadas = visitasFiltradas.slice(
    (paginaVisitas - 1) * itensPorPagina,
    paginaVisitas * itensPorPagina
  )

  const atendimentosPaginados = atendimentosFiltrados.slice(
    (paginaAtendimentos - 1) * itensPorPagina,
    paginaAtendimentos * itensPorPagina
  )

  function open(item: any) {
    setSelected(item)

    setForm({
      nome: item.woman?.name,
      cpf: item.woman?.cpf,
      rg: item.woman?.rg,
      endereco: item.woman?.address,
      cidade: item.municipality?.name,
      estado: "Pará",
      telefone: item.woman?.phone,
      parentesco: [],
      tipoViolencia: [],
      descumprimento: []
    })

    setFormAcompanhamento({
      nome: item.woman?.name,
      cpf: item.woman?.cpf,
      rg: item.woman?.rg,
      endereco: item.woman?.address,
      cidade: item.municipality?.name,
      estado: "Pará",
      contato: item.woman?.phone,
      tipoAtendimento: "",
      medidasCumpridas: ""
    })

    setModalEscolha(true)
  }

  function abrirAcolhimento() {
    if (!selected || hasAtendimento(selected.id)) return

    setModalEscolha(false)
    setModal(true)
  }

  function abrirAcompanhamento() {
    if (!selected || hasAcompanhamento(selected.id)) return

    setModalEscolha(false)
    setModalAcompanhamento(true)
  }

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleAcompanhamentoChange(e: any) {
    setFormAcompanhamento({
      ...formAcompanhamento,
      [e.target.name]: e.target.value
    })
  }

  function toggle(field: string, value: string) {
    const arr = form[field] || []

    if (arr.includes(value)) {
      setForm({ ...form, [field]: arr.filter((v: string) => v !== value) })
    } else {
      setForm({ ...form, [field]: [...arr, value] })
    }
  }

  async function salvar() {
  if (salvandoAtendimento) return

  try {
    setSalvandoAtendimento(true)

    await api.post("/appointment/atendimentos", {
      ...form,
      dataNascimento: form.dataNascimento
        ? new Date(form.dataNascimento).toISOString()
        : null,
      dataVisita: form.dataVisita
        ? new Date(form.dataVisita).toISOString()
        : null,
      agendaId: selected.id
    })

    alert("Atendimento salvo com sucesso")
    setModal(false)

    await carregarDados()
  } catch (error) {
    console.log(error)
    alert("Erro ao salvar atendimento")
  } finally {
    setSalvandoAtendimento(false)
  }
}


  async function salvarAcompanhamento() {
  if (salvandoAcompanhamento) return

  try {
    setSalvandoAcompanhamento(true)

    await api.post("/appointment/acompanhamentos", {
      ...formAcompanhamento,
      dataNascimento: formAcompanhamento.dataNascimento
        ? new Date(formAcompanhamento.dataNascimento).toISOString()
        : null,
      dataAtendimento: formAcompanhamento.dataAtendimento
        ? new Date(formAcompanhamento.dataAtendimento).toISOString()
        : null,
      agendaId: selected.id
    })

    alert("Acompanhamento salvo com sucesso")
    setModalAcompanhamento(false)

    await carregarDados()
  } catch (error) {
    console.log(error)
    alert("Erro ao salvar acompanhamento")
  } finally {
    setSalvandoAcompanhamento(false)
  }
}


  function gerarRelatorioAtendimento(atendimento: any) {
  const acompanhamento = acompanhamentos.find(
    (item: any) => item.agendaId === atendimento.agendaId
  )

  const militaresEscalados =
    atendimento.agenda?.militares
      ?.map((m: any) =>
        `${m.police?.graduacao?.name || ""} ${m.police?.user?.name || ""}`.trim()
      )
      .filter(Boolean)
      .join(", ") || "-"

  const doc = new jsPDF()

  const tableTheme = {
  theme: "grid" as const,
  headStyles: {
    fillColor: [142, 36, 170] as [number, number, number],
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: "bold" as const,
    halign: "center" as const,
    valign: "middle" as const
  },
  bodyStyles: {
    fontSize: 9,
    valign: "middle" as const
  },
  styles: {
    fontSize: 9,
    cellPadding: 3,
    overflow: "linebreak" as const
  },
  columnStyles: {
    0: {
      cellWidth: 55,
      fontStyle: "bold" as const,
      fillColor: [248, 245, 250] as [number, number, number]
    },
    1: {
      cellWidth: 125
    }
  },
  margin: {
    left: 14,
    right: 14
  }
}

  doc.setFontSize(16)
  doc.text("Relatório de Atendimento - SOS MARIA", 14, 18)

  doc.setFontSize(10)
  doc.text(`Agenda: ${atendimento.agendaId}`, 14, 26)
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)

  autoTable(doc, {
    ...tableTheme,
    startY: 40,
    head: [["Dados da Assistida", "Informação"]],
    body: [
      ["Nome", atendimento.nome || atendimento.agenda?.woman?.name || "-"],
      ["CPF", atendimento.cpf || atendimento.agenda?.woman?.cpf || "-"],
      ["RG", atendimento.rg || "-"],
      ["Telefone", atendimento.telefone || atendimento.agenda?.woman?.phone || "-"],
      ["Cidade", atendimento.cidade || atendimento.agenda?.municipality?.name || "-"],
      ["Endereço", atendimento.endereco || atendimento.agenda?.woman?.address || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Guarnição", "Informação"]],
    body: [
      ["Militares escalados", militaresEscalados],
      // ["Componentes informados", atendimento.componentes || "-"],
      ["MPU", atendimento.mpu || "-"],
      [
        "Data da visita",
        atendimento.dataVisita
          ? new Date(atendimento.dataVisita).toLocaleDateString("pt-BR")
          : "-"
      ],
      ["Hora da visita", atendimento.horaVisita || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Acolhimento", "Informação"]],
    body: [
      [
        "Data do cadastro",
        atendimento.createdAt
          ? new Date(atendimento.createdAt).toLocaleString("pt-BR")
          : "-"
      ],
      [
        "Militar que preencheu",
        `${atendimento.police?.graduacao?.name || ""} ${atendimento.police?.user?.name || ""}`.trim() || "-"
      ],
      ["Tipo de violência", atendimento.tipoViolencia?.join(", ") || "-"],
      ["Parentesco", atendimento.parentesco?.join(", ") || "-"],
      ["Medidas protetivas", atendimento.medidas || "-"],
      ["Frequência", atendimento.frequencia || "-"],
      ["Observações", atendimento.observacoes || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Dados do Agressor", "Informação"]],
    body: [
      ["Nome", atendimento.nomeAcusado || "-"],
      ["CPF", atendimento.cpfAcusado || "-"],
      ["RG", atendimento.rgAcusado || "-"],
      ["Endereço", atendimento.enderecoAcusado || "-"],
      ["Situação ocupacional", atendimento.ocupacao || "-"],
      ["Já foi preso", atendimento.preso === true ? "Sim" : atendimento.preso === false ? "Não" : "-"],
      ["Uso de álcool", atendimento.alcool === true ? "Sim" : atendimento.alcool === false ? "Não" : "-"],
      ["Uso de drogas", atendimento.droga === true ? "Sim" : atendimento.droga === false ? "Não" : "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Acompanhamento", "Informação"]],
    body: acompanhamento
      ? [
          ["Status", "Enviado"],
          [
            "Data do atendimento",
            acompanhamento.dataAtendimento
              ? new Date(acompanhamento.dataAtendimento).toLocaleDateString("pt-BR")
              : "-"
          ],
          ["Tipo de atendimento", acompanhamento.tipoAtendimento || "-"],
          ["Medidas cumpridas", acompanhamento.medidasCumpridas || "-"],
          ["Perímetro", acompanhamento.perimetro || "-"],
          ["Bairro", acompanhamento.bairro || "-"],
          ["Observações gerais", acompanhamento.observacoesGerais || "-"]
        ]
      : [["Status", "Finalizado"]]
  })

  const pdfBlob = doc.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)


  window.open(pdfUrl, "_blank")
}


  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando dados...</p>

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
    <>
      <div style={styles.container}>
        <h2>Visitas Agendadas</h2>

        <input
          style={styles.searchInput}
          value={busca}
          placeholder="Buscar por nome, CPF, cidade, agenda ou status..."
          onChange={(e) => {
            setBusca(e.target.value)
            setPaginaVisitas(1)
            setPaginaAtendimentos(1)
          }}
        />

        {visitasFiltradas.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            Nenhuma visita pendente
          </p>
        )}

        <div style={styles.grid}>
          {visitasPaginadas.map((item: any) => {
            const atendimentoEnviado = hasAtendimento(item.id)
            const acompanhamentoEnviado = hasAcompanhamento(item.id)

            return (
              <div key={item.id} style={styles.card}>
                <h3>{item.woman?.name}</h3>

                <p>Data: {new Date(item.date).toLocaleString("pt-BR")}</p>

                <div style={styles.statusArea}>
                  <span style={atendimentoEnviado ? styles.statusOk : styles.statusPendente}>
                    Acolhimento: {atendimentoEnviado ? "Enviado" : "Pendente"}
                  </span>

                  <span style={acompanhamentoEnviado ? styles.statusOk : styles.statusPendente}>
                    Acompanhamento: {acompanhamentoEnviado ? "Enviado" : "Pendente"}
                  </span>
                </div>

                <button style={styles.buton} onClick={() => open(item)}>
                  {atendimentoEnviado || acompanhamentoEnviado
                    ? "Continuar Atendimento"
                    : "Iniciar Atendimento"}
                </button>
              </div>
            )
          })}
        </div>

        <Paginacao
          pagina={paginaVisitas}
          totalPaginas={totalPaginasVisitas}
          setPagina={setPaginaVisitas}
        />

        {modalEscolha && (
          <div style={styles.overlay}>
            <div style={styles.modalEscolha}>
              <h2 style={styles.title}>Escolha o formulário</h2>

              <button
                style={selected && hasAtendimento(selected.id) ? styles.btnDisabled : styles.btnPrimary}
                disabled={selected && hasAtendimento(selected.id)}
                onClick={abrirAcolhimento}
              >
                Questionário de Acolhimento
              </button>

              <button
                style={selected && hasAcompanhamento(selected.id) ? styles.btnDisabled : styles.btnPrimary}
                disabled={selected && hasAcompanhamento(selected.id)}
                onClick={abrirAcompanhamento}
              >
                Questionário de Acompanhamento
              </button>

              <button style={styles.btnCancel} onClick={() => setModalEscolha(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {modalAcompanhamento && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h1 style={styles.title}>Questionário de Acompanhamento</h1>

              <Section title="Identificação da Guarnição">
                <div style={styles.grid}>
                  <input style={styles.input} name="componentes" placeholder="Componentes" onChange={handleAcompanhamentoChange} />
                  <input style={styles.input} name="mpu" placeholder="Nº da MPU" onChange={handleAcompanhamentoChange} />
                  <input style={styles.input} type="date" name="dataAtendimento" onChange={handleAcompanhamentoChange} />
                </div>
              </Section>

              <Section title="Informações da Atendida">
                <div style={styles.grid}>
                  <input style={styles.input} value={formAcompanhamento.nome || ""} disabled />
                  <input style={styles.input} value={formAcompanhamento.rg || ""} disabled />
                  <input style={styles.input} value={formAcompanhamento.cpf || ""} disabled />
                  <input style={styles.input} type="date" name="dataNascimento" onChange={handleAcompanhamentoChange} />
                </div>

                <div style={styles.grid}>
                  <input style={styles.input} value={formAcompanhamento.endereco || ""} disabled />
                  <input style={styles.input} name="perimetro" placeholder="Perímetro" onChange={handleAcompanhamentoChange} />
                  <input style={styles.input} name="bairro" placeholder="Bairro" onChange={handleAcompanhamentoChange} />
                  <input style={styles.input} value={formAcompanhamento.cidade || ""} disabled />
                  <input style={styles.input} value={formAcompanhamento.estado || ""} disabled />
                  <input style={styles.input} value={formAcompanhamento.contato || ""} disabled />
                  <input style={styles.input} type="time" name="horaVisita" onChange={handleAcompanhamentoChange} />
                </div>
              </Section>

              <Section title="Tipo de Atendimento">
                <div style={styles.options}>
                  {[
                    { label: "Visita", value: "VISITA" },
                    { label: "Ronda", value: "RONDA" },
                    { label: "Contato telefônico", value: "CONTATO_TELEFONICO" }
                  ].map((op: any) => (
                    <label key={op.value}>
                      <input
                        type="radio"
                        checked={formAcompanhamento.tipoAtendimento === op.value}
                        onChange={() =>
                          setFormAcompanhamento({
                            ...formAcompanhamento,
                            tipoAtendimento: op.value
                          })
                        }
                      />
                      {op.label}
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Medidas Protetivas">
                <Sub title="As medidas protetivas estão sendo cumpridas?" />

                <div style={styles.options}>
                  <label>
                    <input
                      type="radio"
                      checked={formAcompanhamento.medidasCumpridas === "SIM"}
                      onChange={() =>
                        setFormAcompanhamento({
                          ...formAcompanhamento,
                          medidasCumpridas: "SIM"
                        })
                      }
                    />
                    Sim
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={formAcompanhamento.medidasCumpridas === "NAO"}
                      onChange={() =>
                        setFormAcompanhamento({
                          ...formAcompanhamento,
                          medidasCumpridas: "NAO"
                        })
                      }
                    />
                    Não
                  </label>
                </div>
              </Section>

              <Section title="Observações Gerais da Solicitante">
                <textarea
                  style={styles.textarea}
                  name="observacoesGerais"
                  onChange={handleAcompanhamentoChange}
                />
              </Section>

              <div style={styles.actions}>
                <button style={styles.btnCancel} onClick={() => setModalAcompanhamento(false)}>
                  Cancelar
                </button>

                <button
  style={salvandoAcompanhamento ? styles.btnDisabled : styles.btnPrimary}
  onClick={salvarAcompanhamento}
  disabled={salvandoAcompanhamento}
>
  {salvandoAcompanhamento ? "Salvando..." : "Salvar Acompanhamento"}
</button>

              </div>
            </div>
          </div>
        )}

        {modal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h1 style={styles.title}>Questionário de Acolhimento</h1>

              <Section title="Guarnição">
                <div style={styles.grid}>
                  <input style={styles.input} name="componentes" placeholder="Componentes" onChange={handleChange} />
                  <input style={styles.input} name="mpu" placeholder="MPU" onChange={handleChange} />
                  <input style={styles.input} type="date" name="dataVisita" onChange={handleChange} />
                </div>

                <div style={styles.militares}>
                  {selected?.militares?.map((m: any) => (
                    <span key={m.id} style={styles.chip}>
                      {m.police?.graduacao?.name} {m.police?.user?.name}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Dados da Atendida">
                <div style={styles.grid}>
                  <input style={styles.input} value={form.nome || ""} disabled />
                  <input style={styles.input} value={form.cpf || ""} disabled />
                  <input style={styles.input} value={form.rg || ""} disabled />
                  <input style={styles.input} type="date" name="dataNascimento" onChange={handleChange} />
                </div>

                <div style={styles.grid}>
                  <input style={styles.input} value={form.endereco || ""} disabled />
                  <input style={styles.input} value={form.telefone || ""} disabled />
                  <input style={styles.input} value={form.cidade || ""} disabled />
                  <input style={styles.input} value={form.estado || ""} disabled />
                </div>

                <div style={styles.grid}>
                  <input style={styles.input} type="time" name="horaVisita" onChange={handleChange} />
                </div>
              </Section>

              <Section title="Perfil da Atendida">
                <div style={styles.grid}>
                  <input style={styles.input} name="sexo" placeholder="Sexo" onChange={handleChange} />
                  <input style={styles.input} name="etnia" placeholder="Etnia" onChange={handleChange} />
                  <input style={styles.input} name="estadoCivil" placeholder="Estado Civil" onChange={handleChange} />
                  <input style={styles.input} name="escolaridade" placeholder="Escolaridade" onChange={handleChange} />
                </div>

                <div style={styles.grid}>
                  <input style={styles.input} name="profissao" placeholder="Profissão" onChange={handleChange} />
                  <input style={styles.input} name="renda" placeholder="Renda" onChange={handleChange} />

                  <div style={styles.options}>
                    <label>
                      <input
                        type="radio"
                        checked={form.filhos === true}
                        onChange={() => setForm({ ...form, filhos: true })}
                      />
                      Sim
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={form.filhos === false}
                        onChange={() => setForm({ ...form, filhos: false })}
                      />
                      Não
                    </label>
                  </div>

                  {form.filhos === true && (
                    <input
                      style={styles.input}
                      name="quantidadeFilhos"
                      placeholder="Quantos filhos?"
                      onChange={handleChange}
                    />
                  )}
                </div>

                <div style={styles.grid}>
                  <input style={styles.input} name="moramComVoce" placeholder="Quantos moram com você?" onChange={handleChange} />
                  <input style={styles.input} name="moradia" placeholder="Moradia" onChange={handleChange} />
                </div>
              </Section>

              <Section title="Informações da Violência">
                <Sub title="Parentesco com agressor" />

                <Options>
                  {["MARIDO", "EX CÔNJUGE", "NAMORADO", "MÃE", "FILHO", "PADRASTRO", "PAI", "EX NAMORADO"].map((op) => (
                    <Check
                      key={op}
                      label={op}
                      checked={form.parentesco?.includes(op)}
                      onChange={() => toggle("parentesco", op)}
                    />
                  ))}

                  <Check
                    label="OUTRO"
                    checked={form.parentesco?.includes("OUTRO")}
                    onChange={() => toggle("parentesco", "OUTRO")}
                  />
                </Options>

                {form.parentesco?.includes("OUTRO") && (
                  <input style={styles.input} name="outroParentesco" placeholder="Qual?" onChange={handleChange} />
                )}

                <Sub title="Possui filhos com acusado" />
                <RadioGroup field="filhosAcusado" form={form} setForm={setForm} />

                {form.filhosAcusado === true && (
                  <input style={styles.input} name="quantidadeFilhosAcusado" placeholder="Quantos?" onChange={handleChange} />
                )}

                <Sub title="Medidas protetivas cumpridas" />

                <div style={styles.options}>
                  <label>
                    <input
                      type="radio"
                      checked={form.medidas === "SIM"}
                      onChange={() => setForm({ ...form, medidas: "SIM" })}
                    />
                    Sim
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={form.medidas === "NAO"}
                      onChange={() => setForm({ ...form, medidas: "NAO" })}
                    />
                    Não
                  </label>
                </div>

                <Sub title="Descumprimento" />

                <Options>
                  {["TELEFONE", "RESIDÊNCIA", "TRABALHO"].map((op) => (
                    <Check
                      key={op}
                      label={op}
                      checked={form.descumprimento?.includes(op)}
                      onChange={() => toggle("descumprimento", op)}
                    />
                  ))}

                  <Check
                    label="OUTROS"
                    checked={form.descumprimento?.includes("OUTROS")}
                    onChange={() => toggle("descumprimento", "OUTROS")}
                  />
                </Options>

                {form.descumprimento?.includes("OUTROS") && (
                  <input style={styles.input} name="outroDescumprimento" placeholder="Descreva" onChange={handleChange} />
                )}

                <Sub title="Tipo de violência" />

                <Options>
                  {["FÍSICA", "PSICOLÓGICA", "SEXUAL", "PATRIMONIAL", "MORAL"].map((op) => (
                    <Check
                      key={op}
                      label={op}
                      checked={form.tipoViolencia?.includes(op)}
                      onChange={() => toggle("tipoViolencia", op)}
                    />
                  ))}
                </Options>

                <Sub title="Frequência da violência" />

                <div style={styles.options}>
                  <label>
                    <input
                      type="radio"
                      checked={form.frequencia === "DIARIA"}
                      onChange={() => setForm({ ...form, frequencia: "DIARIA" })}
                    />
                    Diária
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={form.frequencia === "SEMANAL"}
                      onChange={() => setForm({ ...form, frequencia: "SEMANAL" })}
                    />
                    Semanal
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={form.frequencia === "ESPORADICA"}
                      onChange={() => setForm({ ...form, frequencia: "ESPORADICA" })}
                    />
                    Esporádica
                  </label>
                </div>

                <Sub title="Marcas" />
                <RadioGroup field="marcas" form={form} setForm={setForm} />
              </Section>

              <Section title="Dados do Acusado">
                <div style={styles.grid}>
                  <input style={styles.input} name="nomeAcusado" placeholder="Nome" onChange={handleChange} />
                  <input style={styles.input} name="cpfAcusado" placeholder="CPF" onChange={handleChange} />
                  <input style={styles.input} name="rgAcusado" placeholder="RG" onChange={handleChange} />
                  <input style={styles.input} name="enderecoAcusado" placeholder="Endereço" onChange={handleChange} />
                </div>

                <Sub title="Situação ocupacional" />

                <RadioGroup
                  field="ocupacao"
                  form={form}
                  setForm={setForm}
                  options={[
                    { label: "Empregado", value: "EMPREGADO" },
                    { label: "Desempregado", value: "DESEMPREGADO" },
                    { label: "Autônomo", value: "AUTONOMO" },
                    { label: "Aposentado", value: "APOSENTADO" }
                  ]}
                />

                <Sub title="Já foi preso" />
                <RadioGroup field="preso" form={form} setForm={setForm} />

                <Sub title="Uso de álcool" />
                <RadioGroup field="alcool" form={form} setForm={setForm} />

                <Sub title="Uso de drogas" />
                <RadioGroup field="droga" form={form} setForm={setForm} />
              </Section>

              <Section title="Observações">
                <textarea style={styles.textarea} name="observacoes" onChange={handleChange} />
              </Section>

              <div style={styles.actions}>
                <button style={styles.btnCancel} onClick={() => setModal(false)}>
                  Cancelar
                </button>

                <button
                  style={salvandoAtendimento ? styles.btnDisabled : styles.btnPrimary}
                  onClick={salvar}
                  disabled={salvandoAtendimento}>
                  {salvandoAtendimento ? "Salvando..." : "Salvar Atendimento"}
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.container}>
        <h2>Atendimentos Realizados</h2>

        {atendimentosFiltrados.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Nenhum atendimento realizado
          </p>
        ) : (
          atendimentosPaginados.map((a: any) => (
            <div key={a.id} style={styles.card}>
              <strong>{a.nome || a.agenda?.woman?.name}</strong>

              <p>Agenda: {a.agendaId}</p>

              <p>
                Militares Envolvidos:{" "}
                {a.agenda?.militares
                  ?.map((m: any) => `${m.police?.graduacao?.name} ${m.police?.user?.name}`)
                  .join(", ")}
              </p>

              <p>Data e Hora: {new Date(a.createdAt).toLocaleString("pt-BR")}</p>

              <p>
                Militar que Preencheu: {a.police?.graduacao?.name} - {a.police?.user?.name}
              </p>

              <p>Tipo de Violência: {a.tipoViolencia?.join(", ")}</p>

              <button style={styles.btnPdf} onClick={() => gerarRelatorioAtendimento(a)}>
                Gerar Relatório PDF
              </button>
            </div>
          ))
        )}

        <Paginacao
          pagina={paginaAtendimentos}
          totalPaginas={totalPaginasAtendimentos}
          setPagina={setPaginaAtendimentos}
        />
      </div>
    </>
  )
}

function Section({ title, children }: any) {
  return (
    <div style={styles.section}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

function Sub({ title }: any) {
  return <h4 style={{ marginTop: 10 }}>{title}</h4>
}

function Check({ label, checked, onChange }: any) {
  return (
    <label style={styles.check}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}

function Options({ children }: any) {
  return <div style={styles.options}>{children}</div>
}

function RadioGroup({ field, form, setForm, options }: any) {
  if (!options) {
    return (
      <div style={styles.options}>
        <label>
          <input
            type="radio"
            checked={form[field] === true}
            onChange={() => setForm({ ...form, [field]: true })}
          />
          Sim
        </label>

        <label>
          <input
            type="radio"
            checked={form[field] === false}
            onChange={() => setForm({ ...form, [field]: false })}
          />
          Não
        </label>
      </div>
    )
  }

  return (
    <div style={styles.options}>
      {options.map((opt: any) => {
        const value = typeof opt === "string" ? opt : opt.value
        const label = typeof opt === "string" ? opt : opt.label

        return (
          <label key={value}>
            <input
              type="radio"
              checked={form[field] === value}
              onChange={() => setForm({ ...form, [field]: value })}
            />
            {label}
          </label>
        )
      })}
    </div>
  )
}

function Paginacao({ pagina, totalPaginas, setPagina }: any) {
  return (
    <div style={styles.pagination}>
      <button
        style={pagina === 1 ? styles.pageButtonDisabled : styles.pageButton}
        disabled={pagina === 1}
        onClick={() => setPagina((prev: number) => Math.max(prev - 1, 1))}
      >
        Anterior
      </button>

      <span style={styles.pageInfo}>
        Página {pagina} de {totalPaginas}
      </span>

      <button
        style={pagina === totalPaginas ? styles.pageButtonDisabled : styles.pageButton}
        disabled={pagina === totalPaginas}
        onClick={() => setPagina((prev: number) => Math.min(prev + 1, totalPaginas))}
      >
        Próxima
      </button>
    </div>
  )
}

const styles: any = {
  container: {
    padding: 20
  },

  searchInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "16px"
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    zIndex: 999
  },

  modal: {
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "95vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "16px",
    padding: "20px"
  },

  modalEscolha: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  title: {
    textAlign: "center",
    marginBottom: 20
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 10,
    marginBottom: 20
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "100%"
  },

  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },

  section: {
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: 15
  },

  options: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },

  militares: {
    marginTop: 10,
    display: "flex",
    flexWrap: "wrap",
    gap: 5
  },

  chip: {
    background: "#f1f1f1",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px"
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap"
  },

  btnPrimary: {
    flex: 1,
    background: "#8e24aa",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  },

  btnDisabled: {
    flex: 1,
    background: "#cfcfcf",
    color: "#777",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "not-allowed"
  },

  btnCancel: {
    flex: 1,
    background: "#ddd",
    padding: "12px",
    borderRadius: "8px",
    border: "none"
  },

  btnPdf: {
    marginTop: 10,
    background: "#1565c0",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  },

  card: {
    border: "1px solid #eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  buton: {
    marginTop: 10,
    background: "#8e24aa",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  },

  statusArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px"
  },

  statusOk: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600
  },

  statusPendente: {
    background: "#fff3e0",
    color: "#ef6c00",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    margin: "18px 0",
    flexWrap: "wrap"
  },

  pageButton: {
    background: "#8e24aa",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  },

  pageButtonDisabled: {
    background: "#d1d1d1",
    color: "#777",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "not-allowed"
  },

  pageInfo: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#555"
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    background: "#fafafa"
  },

  spinner: {
    width: "48px",
    height: "48px",
    border: "5px solid #eee",
    borderTop: "5px solid #8e24aa",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },

  loadingText: {
    color: "#8e24aa",
    fontSize: "16px",
    fontWeight: 600
  }
}
