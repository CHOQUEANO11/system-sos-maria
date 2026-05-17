/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const [orientacoesAutor, setOrientacoesAutor] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  const [busca, setBusca] = useState("")
  const [paginaVisitas, setPaginaVisitas] = useState(1)
  const [paginaAtendimentos, setPaginaAtendimentos] = useState(1)

  const itensPorPagina = 5

  const [modalEscolha, setModalEscolha] = useState(false)
  const [modal, setModal] = useState(false)
  const [modalAcompanhamento, setModalAcompanhamento] = useState(false)
  const [modalAutor, setModalAutor] = useState(false)
  const [salvandoAtendimento, setSalvandoAtendimento] = useState(false)
  const [salvandoAcompanhamento, setSalvandoAcompanhamento] = useState(false)
  const [salvandoAutor, setSalvandoAutor] = useState(false)


  const [form, setForm] = useState<any>({
    parentesco: [],
    tipoViolencia: [],
    descumprimento: []
  })

  const [formAcompanhamento, setFormAcompanhamento] = useState<any>({
    tipoAtendimento: "",
    medidasCumpridas: ""
  })

  const [formAutor, setFormAutor] = useState<any>({
    formaContato: []
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
        loadAcompanhamentos(),
        loadOrientacoesAutor()
      ])
    } finally {
      setLoading(false)
    }
  }

  async function load() {
    const params = {
      userId: user?.id,
      policeUserId: user?.id,
      policeId: (user as any)?.policeId || (user as any)?.policeProfile?.id,
      unidadeId: user?.unidadeId
    }

    const res = await api.get("/agenda/police", { params })
    const agendas = normalizeList(res.data)

    if (user?.role !== "POLICE") {
      setData(agendas)
      return
    }

    const filteredAgendas = agendas.filter((agenda: any) =>
      isCurrentPoliceAssigned(agenda)
    )

    if (filteredAgendas.length > 0) {
      setData(filteredAgendas)
      return
    }

    if (agendas.length > 0 && !agendas.some((agenda: any) => hasPoliceAssignmentData(agenda))) {
      setData(agendas)
      return
    }

    const fallbackRes = await api.get("/agenda", {
      params: {
        unidadeId: user?.unidadeId,
        userId: user?.id,
        policeUserId: user?.id,
        policeId: (user as any)?.policeId || (user as any)?.policeProfile?.id
      }
    })

    setData(normalizeList(fallbackRes.data).filter((agenda: any) =>
      isCurrentPoliceAssigned(agenda)
    ))
  }

  function normalizeList(response: any) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    return []
  }

  function hasPoliceAssignmentData(agenda: any) {
    return Boolean(
      agenda.policeId ||
      agenda.policeUserId ||
      agenda.police ||
      agenda.militares?.length
    )
  }

  function isCurrentPoliceAssigned(agenda: any) {
    if (!user) return false

    const currentUser = user as any
    const policeIds = [
      currentUser.policeId,
      currentUser.policeProfile?.id,
      currentUser.police?.id
    ].filter(Boolean)

    const userIds = [
      currentUser.id,
      currentUser.userId,
      currentUser.policeProfile?.userId,
      currentUser.police?.userId,
      currentUser.police?.user?.id
    ].filter(Boolean)

    const documents = [
      currentUser.cpf,
      currentUser.rg,
      currentUser.email
    ].filter(Boolean)

    if (policeIds.includes(agenda.policeId) || userIds.includes(agenda.policeUserId)) {
      return true
    }

    return agenda.militares?.some((item: any) => {
      const linkedPoliceIds = [
        item.policeId,
        item.id,
        item.police?.id
      ].filter(Boolean)

      const linkedUserIds = [
        item.userId,
        item.police?.userId,
        item.police?.user?.id,
        item.user?.id
      ].filter(Boolean)

      const linkedDocuments = [
        item.police?.user?.cpf,
        item.police?.user?.rg,
        item.police?.user?.email,
        item.user?.cpf,
        item.user?.rg,
        item.user?.email
      ].filter(Boolean)

      return (
        linkedPoliceIds.some((id: string) => policeIds.includes(id)) ||
        linkedUserIds.some((id: string) => userIds.includes(id)) ||
        linkedDocuments.some((value: string) => documents.includes(value))
      )
    })
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

  async function loadOrientacoesAutor() {
    try {
      const response = await api.get("/appointment/author-orientations")
      setOrientacoesAutor(normalizeList(response.data))
    } catch (error) {
      console.log("Orientações do autor ainda não disponíveis", error)
      setOrientacoesAutor([])
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

  function hasOrientacaoAutor(agendaId: string) {
    return orientacoesAutor.some((item: any) => item.agendaId === agendaId)
  }

  function isAgendaAutor(item: any) {
    return item.targetType === "AUTHOR" || item.agendaType === "AUTHOR" || Boolean(getAgendaAuthor(item).name || getAgendaAuthor(item).nome)
  }

  function getAgendaAuthor(item: any) {
    return item.author || item.authorData || item.aggressor || item.accused || {}
  }

  function getPessoaAgenda(item: any) {
    if (isAgendaAutor(item)) {
      const author = getAgendaAuthor(item)

      return {
        name: author.nome || author.name || "Autor não informado",
        cpf: author.cpf,
        rg: author.rg,
        phone: author.contato || author.phone,
        address: author.endereco || author.address,
        bairro: author.bairro || author.neighborhood,
        cidade: author.cidade || author.city || item.municipality?.name,
        estado: author.estado || author.state || "Pará"
      }
    }

    return item.woman || {}
  }

  function isAgendaCompleta(agendaId: string) {
    return hasAtendimento(agendaId) && hasAcompanhamento(agendaId)
  }

  function isVisitaConcluida(item: any) {
    if (isAgendaAutor(item)) {
      return hasOrientacaoAutor(item.id)
    }

    return isAgendaCompleta(item.id)
  }

  const visitasPendentes = useMemo(() => {
    return data.filter((item: any) => !isVisitaConcluida(item))
  }, [data, atendidos, acompanhamentos, orientacoesAutor])

  const visitasFiltradas = useMemo(() => {
    const texto = busca.toLowerCase().trim()

    if (!texto) return visitasPendentes

    return visitasPendentes.filter((item: any) => {
      const pessoa = getPessoaAgenda(item)
      const atendimentoEnviado = hasAtendimento(item.id)
      const acompanhamentoEnviado = hasAcompanhamento(item.id)
      const orientacaoAutorEnviada = hasOrientacaoAutor(item.id)

      return [
        pessoa.name,
        pessoa.cpf,
        pessoa.phone,
        item.municipality?.name,
        item.id,
        isAgendaAutor(item) ? "autor agressor orientação" : "",
        atendimentoEnviado ? "acolhimento enviado" : "acolhimento pendente",
        acompanhamentoEnviado ? "acompanhamento enviado" : "acompanhamento pendente",
        orientacaoAutorEnviada ? "orientação do autor enviada" : "orientação do autor pendente"
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(texto)
    })
  }, [busca, visitasPendentes, atendidos, acompanhamentos, orientacoesAutor])

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

  const acompanhamentosPermitidos = useMemo(() => {
  if (!user) return []

  if (user.role === "SUPER_ADMIN") {
    return acompanhamentos
  }

  if (user.role === "ADMIN") {
    return acompanhamentos.filter((item: any) =>
      item.agenda?.unidadeId === user.unidadeId ||
      item.agenda?.unidade?.id === user.unidadeId
    )
  }

  if (user.role === "POLICE") {
    return acompanhamentos.filter((item: any) =>
      item.agenda?.militares?.some((m: any) =>
        m.police?.userId === user.id ||
        m.police?.user?.id === user.id
      )
    )
  }

  return []
}, [acompanhamentos, user])

  const orientacoesAutorPermitidas = useMemo(() => {
  if (!user) return []

  if (user.role === "SUPER_ADMIN") {
    return orientacoesAutor
  }

  if (user.role === "ADMIN") {
    return orientacoesAutor.filter((item: any) =>
      item.agenda?.unidadeId === user.unidadeId ||
      item.agenda?.unidade?.id === user.unidadeId
    )
  }

  if (user.role === "POLICE") {
    return orientacoesAutor.filter((item: any) =>
      item.agenda?.militares?.some((m: any) =>
        m.police?.userId === user.id ||
        m.police?.user?.id === user.id
      ) ||
      item.police?.userId === user.id ||
      item.police?.user?.id === user.id
    )
  }

  return []
}, [orientacoesAutor, user])

  const registrosRealizados = useMemo(() => {
  return [
    ...atendimentosPermitidos.map((item: any) => ({
      id: `acolhimento-${item.id}`,
      tipo: "ACOLHIMENTO",
      data: item.createdAt,
      agendaId: item.agendaId,
      agenda: item.agenda,
      registro: item
    })),
    ...acompanhamentosPermitidos.map((item: any) => ({
      id: `acompanhamento-${item.id}`,
      tipo: "ACOMPANHAMENTO",
      data: item.createdAt,
      agendaId: item.agendaId,
      agenda: item.agenda,
      registro: item
    })),
    ...orientacoesAutorPermitidas.map((item: any) => ({
      id: `autor-${item.id}`,
      tipo: "AUTOR",
      data: item.createdAt,
      agendaId: item.agendaId,
      agenda: item.agenda,
      registro: item
    }))
  ].sort((a: any, b: any) =>
    new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()
  )
}, [atendimentosPermitidos, acompanhamentosPermitidos, orientacoesAutorPermitidas])

  const atendimentosFiltrados = useMemo(() => {
  const texto = busca.toLowerCase().trim()

  if (!texto) return registrosRealizados

  return registrosRealizados.filter((item: any) =>
    [
      item.tipo,
      item.registro?.nome,
      item.registro?.author?.nome,
      item.registro?.author?.name,
      item.agenda?.author?.nome,
      item.agenda?.author?.name,
      item.agenda?.woman?.name,
      item.agenda?.woman?.cpf,
      item.agenda?.woman?.phone,
      item.agenda?.municipality?.name,
      item.agendaId,
      item.registro?.police?.user?.name,
      item.registro?.police?.graduacao?.name,
      item.registro?.tipoViolencia?.join(" "),
      item.registro?.tipoAtendimento
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(texto)
  )
}, [busca, registrosRealizados])


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
    const pessoa = getPessoaAgenda(item)

    setForm({
      nome: pessoa.name,
      cpf: pessoa.cpf,
      rg: pessoa.rg,
      endereco: pessoa.address,
      cidade: pessoa.cidade || item.municipality?.name,
      estado: pessoa.estado || "Pará",
      telefone: pessoa.phone,
      parentesco: [],
      tipoViolencia: [],
      descumprimento: []
    })

    setFormAcompanhamento({
      nome: pessoa.name,
      cpf: pessoa.cpf,
      rg: pessoa.rg,
      endereco: pessoa.address,
      cidade: pessoa.cidade || item.municipality?.name,
      estado: pessoa.estado || "Pará",
      contato: pessoa.phone,
      tipoAtendimento: "",
      medidasCumpridas: ""
    })

    setFormAutor({
      componentes: "",
      mpu: "",
      dataVisita: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
      nome: pessoa.name,
      rg: pessoa.rg,
      cpf: pessoa.cpf,
      dataNascimento: "",
      endereco: pessoa.address,
      perimetro: "",
      bairro: pessoa.bairro,
      cidade: pessoa.cidade || item.municipality?.name,
      estado: pessoa.estado || "Pará",
      contato: pessoa.phone,
      horaVisita: item.date ? new Date(item.date).toTimeString().slice(0, 5) : "",
      sexo: "",
      etniaCor: "",
      escolaridade: "",
      estadoCivil: "",
      parentescoDenunciante: "",
      outroParentesco: "",
      trabalha: "",
      profissao: "",
      rendaFamiliar: "",
      filhos: "",
      quantidadeFilhos: "",
      filhosMoramComVoce: "",
      filhosDenunciante: "",
      quantidadeFilhosDenunciante: "",
      programaSocial: "",
      qualProgramaSocial: "",
      moradia: "",
      consomeAlcool: "",
      quaisAlcool: "",
      frequenciaAlcool: "",
      consomeDrogas: "",
      quaisDrogas: "",
      frequenciaDrogas: "",
      tratamentoDependencia: "",
      transtornoMental: "",
      remedioControlado: "",
      resideProximoVitima: "",
      cienteMedidaProtetiva: "",
      ultimoContatoSolicitante: "",
      formaContato: [],
      outraFormaContato: "",
      contatoFilhos: "",
      comoContatoFilhos: "",
      frequenciaContato: "",
      outraFrequenciaContato: "",
      antecedentesCriminais: "",
      quaisAntecedentes: "",
      observacoesGerais: ""
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

  function abrirFormularioAutor() {
    if (!selected || hasOrientacaoAutor(selected.id)) return

    setModalEscolha(false)
    setModalAutor(true)
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

  function handleAutorChange(e: any) {
    setFormAutor({
      ...formAutor,
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

  function toggleAutor(field: string, value: string) {
    const arr = formAutor[field] || []

    if (arr.includes(value)) {
      setFormAutor({ ...formAutor, [field]: arr.filter((v: string) => v !== value) })
    } else {
      setFormAutor({ ...formAutor, [field]: [...arr, value] })
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

  async function salvarAutor() {
  if (salvandoAutor) return

  const payload = {
    ...formAutor,
    dataNascimento: formAutor.dataNascimento
      ? new Date(formAutor.dataNascimento).toISOString()
      : null,
    dataVisita: formAutor.dataVisita
      ? new Date(formAutor.dataVisita).toISOString()
      : null,
    agendaId: selected.id
  }

  try {
    setSalvandoAutor(true)

    try {
      await api.post("/appointment/author-orientations", payload)
    } catch (error) {
      await api.post("/appointment/orientacoes-autor", payload)
    }

    alert("Orientação do autor salva com sucesso")
    setModalAutor(false)

    await carregarDados()
  } catch (error) {
    console.log(error)
    alert("Erro ao salvar orientação do autor")
  } finally {
    setSalvandoAutor(false)
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

  function getPdfTableTheme() {
  return {
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
        cellWidth: 58,
        fontStyle: "bold" as const,
        fillColor: [248, 245, 250] as [number, number, number]
      },
      1: {
        cellWidth: 122
      }
    },
    margin: {
      left: 14,
      right: 14
    }
  }
}

  function openPdf(doc: jsPDF) {
  const pdfBlob = doc.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)

  window.open(pdfUrl, "_blank")
}

  function getMilitaresEscalados(agenda: any) {
  return agenda?.militares
    ?.map((m: any) =>
      `${m.police?.graduacao?.name || ""} ${m.police?.user?.name || ""}`.trim()
    )
    .filter(Boolean)
    .join(", ") || "-"
}

  function gerarRelatorioAcompanhamento(acompanhamento: any) {
  const doc = new jsPDF()
  const tableTheme = getPdfTableTheme()

  doc.setFontSize(16)
  doc.text("Relatório de Acompanhamento - SOS MARIA", 14, 18)

  doc.setFontSize(10)
  doc.text(`Agenda: ${acompanhamento.agendaId || "-"}`, 14, 26)
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)

  autoTable(doc, {
    ...tableTheme,
    startY: 40,
    head: [["Dados da Atendida", "Informação"]],
    body: [
      ["Nome", acompanhamento.nome || acompanhamento.agenda?.woman?.name || "-"],
      ["CPF", acompanhamento.cpf || acompanhamento.agenda?.woman?.cpf || "-"],
      ["RG", acompanhamento.rg || "-"],
      ["Telefone", acompanhamento.contato || acompanhamento.agenda?.woman?.phone || "-"],
      ["Cidade", acompanhamento.cidade || acompanhamento.agenda?.municipality?.name || "-"],
      ["Endereço", acompanhamento.endereco || acompanhamento.agenda?.woman?.address || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Guarnição", "Informação"]],
    body: [
      ["Militares escalados", getMilitaresEscalados(acompanhamento.agenda)],
      ["Componentes informados", acompanhamento.componentes || "-"],
      ["MPU", acompanhamento.mpu || "-"],
      [
        "Data do atendimento",
        acompanhamento.dataAtendimento
          ? new Date(acompanhamento.dataAtendimento).toLocaleDateString("pt-BR")
          : "-"
      ],
      ["Hora da visita", acompanhamento.horaVisita || "-"],
      [
        "Militar que preencheu",
        `${acompanhamento.police?.graduacao?.name || ""} ${acompanhamento.police?.user?.name || ""}`.trim() || "-"
      ]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Acompanhamento", "Informação"]],
    body: [
      [
        "Data do cadastro",
        acompanhamento.createdAt
          ? new Date(acompanhamento.createdAt).toLocaleString("pt-BR")
          : "-"
      ],
      ["Tipo de atendimento", acompanhamento.tipoAtendimento || "-"],
      ["Medidas cumpridas", acompanhamento.medidasCumpridas || "-"],
      ["Perímetro", acompanhamento.perimetro || "-"],
      ["Bairro", acompanhamento.bairro || "-"],
      ["Observações gerais", acompanhamento.observacoesGerais || "-"]
    ]
  })

  openPdf(doc)
}

  function gerarRelatorioAutor(orientacao: any) {
  const doc = new jsPDF()
  const tableTheme = getPdfTableTheme()

  doc.setFontSize(16)
  doc.text("Relatório de Orientação ao Autor - SOS MARIA", 14, 18)

  doc.setFontSize(10)
  doc.text(`Agenda: ${orientacao.agendaId || "-"}`, 14, 26)
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)

  autoTable(doc, {
    ...tableTheme,
    startY: 40,
    head: [["Identificação da Guarnição", "Informação"]],
    body: [
      ["Militares escalados", getMilitaresEscalados(orientacao.agenda)],
      ["Componentes informados", orientacao.componentes || "-"],
      ["MPU", orientacao.mpu || "-"],
      [
        "Data da visita",
        orientacao.dataVisita
          ? new Date(orientacao.dataVisita).toLocaleDateString("pt-BR")
          : "-"
      ],
      ["Hora da visita", orientacao.horaVisita || "-"],
      [
        "Militar que preencheu",
        `${orientacao.police?.graduacao?.name || ""} ${orientacao.police?.user?.name || ""}`.trim() || "-"
      ]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Informações do Autor", "Informação"]],
    body: [
      ["Nome", orientacao.nome || orientacao.author?.nome || "-"],
      ["CPF", orientacao.cpf || orientacao.author?.cpf || "-"],
      ["RG", orientacao.rg || orientacao.author?.rg || "-"],
      [
        "Data nascimento",
        orientacao.dataNascimento
          ? new Date(orientacao.dataNascimento).toLocaleDateString("pt-BR")
          : "-"
      ],
      ["Endereço", orientacao.endereco || orientacao.author?.endereco || "-"],
      ["Perímetro", orientacao.perimetro || "-"],
      ["Bairro", orientacao.bairro || orientacao.author?.bairro || "-"],
      ["Cidade", orientacao.cidade || orientacao.author?.cidade || "-"],
      ["Estado", orientacao.estado || orientacao.author?.estado || "-"],
      ["Contato", orientacao.contato || orientacao.author?.telefone || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Perfil do Autor", "Informação"]],
    body: [
      ["Sexo", orientacao.sexo || "-"],
      ["Etnia/Cor", orientacao.etniaCor || "-"],
      ["Escolaridade", orientacao.escolaridade || "-"],
      ["Estado civil", orientacao.estadoCivil || "-"],
      ["Parentesco denunciante", orientacao.parentescoDenunciante || "-"],
      ["Outro parentesco", orientacao.outroParentesco || "-"],
      ["Trabalha", orientacao.trabalha || "-"],
      ["Profissão", orientacao.profissao || "-"],
      ["Renda familiar", orientacao.rendaFamiliar || "-"],
      ["Possui filhos", orientacao.filhos || "-"],
      ["Quantidade de filhos", orientacao.quantidadeFilhos || "-"],
      ["Filhos moram com você", orientacao.filhosMoramComVoce || "-"],
      ["Filhos com denunciante", orientacao.filhosDenunciante || "-"],
      ["Quantidade filhos denunciante", orientacao.quantidadeFilhosDenunciante || "-"],
      ["Programa social", orientacao.programaSocial || "-"],
      ["Qual programa", orientacao.qualProgramaSocial || "-"],
      ["Moradia", orientacao.moradia || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Álcool, drogas e saúde", "Informação"]],
    body: [
      ["Consome álcool", orientacao.consomeAlcool || "-"],
      ["Quais álcool", orientacao.quaisAlcool || "-"],
      ["Frequência álcool", orientacao.frequenciaAlcool || "-"],
      ["Consome drogas", orientacao.consomeDrogas || "-"],
      ["Quais drogas", orientacao.quaisDrogas || "-"],
      ["Frequência drogas", orientacao.frequenciaDrogas || "-"],
      ["Tratamento dependência", orientacao.tratamentoDependencia || "-"],
      ["Transtorno mental", orientacao.transtornoMental || "-"],
      ["Remédio controlado", orientacao.remedioControlado || "-"],
      ["Reside próximo da vítima", orientacao.resideProximoVitima || "-"]
    ]
  })

  autoTable(doc, {
    ...tableTheme,
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Informações da Situação", "Informação"]],
    body: [
      ["Ciente medida protetiva", orientacao.cienteMedidaProtetiva || "-"],
      ["Último contato solicitante", orientacao.ultimoContatoSolicitante || "-"],
      ["Forma do contato", orientacao.formaContato?.join(", ") || "-"],
      ["Outra forma", orientacao.outraFormaContato || "-"],
      ["Contato com filhos", orientacao.contatoFilhos || "-"],
      ["Como contato filhos", orientacao.comoContatoFilhos || "-"],
      ["Frequência contato", orientacao.frequenciaContato || "-"],
      ["Outra frequência", orientacao.outraFrequenciaContato || "-"],
      ["Antecedentes criminais", orientacao.antecedentesCriminais || "-"],
      ["Quais antecedentes", orientacao.quaisAntecedentes || "-"],
      ["Observações gerais", orientacao.observacoesGerais || "-"]
    ]
  })

  openPdf(doc)
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
            const pessoa = getPessoaAgenda(item)
            const agendaAutor = isAgendaAutor(item)
            const atendimentoEnviado = hasAtendimento(item.id)
            const acompanhamentoEnviado = hasAcompanhamento(item.id)
            const orientacaoAutorEnviada = hasOrientacaoAutor(item.id)

            return (
              <div key={item.id} style={styles.card}>
                <h3>{pessoa.name}</h3>

                <p>Data: {new Date(item.date).toLocaleString("pt-BR")}</p>
                <p>Tipo: {agendaAutor ? "Orientação ao autor" : "Visita da assistida"}</p>

                <div style={styles.statusArea}>
                  {agendaAutor ? (
                    <span style={orientacaoAutorEnviada ? styles.statusOk : styles.statusPendente}>
                      Orientação ao autor: {orientacaoAutorEnviada ? "Enviada" : "Pendente"}
                    </span>
                  ) : (
                    <>
                  <span style={atendimentoEnviado ? styles.statusOk : styles.statusPendente}>
                    Acolhimento: {atendimentoEnviado ? "Enviado" : "Pendente"}
                  </span>

                  <span style={acompanhamentoEnviado ? styles.statusOk : styles.statusPendente}>
                    Acompanhamento: {acompanhamentoEnviado ? "Enviado" : "Pendente"}
                  </span>
                    </>
                  )}
                </div>

                <button style={styles.buton} onClick={() => open(item)}>
                  {atendimentoEnviado || acompanhamentoEnviado || orientacaoAutorEnviada
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

              {selected && isAgendaAutor(selected) ? (
                <button
                  style={selected && hasOrientacaoAutor(selected.id) ? styles.btnDisabled : styles.btnPrimary}
                  disabled={!selected || hasOrientacaoAutor(selected.id)}
                  onClick={abrirFormularioAutor}
                >
                  Formulário de Orientação ao Autor
                </button>
              ) : (
                <>
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
                </>
              )}

              <button style={styles.btnCancel} onClick={() => setModalEscolha(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {modalAutor && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h1 style={styles.title}>Formulário de Orientação ao Autor</h1>

              <Section title="Identificação da Guarnição">
                <div style={styles.grid}>
                  <input style={styles.input} name="componentes" placeholder="Componentes" value={formAutor.componentes || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="mpu" placeholder="Nº da MPU" value={formAutor.mpu || ""} onChange={handleAutorChange} />
                  <input style={styles.input} type="date" name="dataVisita" value={formAutor.dataVisita || ""} onChange={handleAutorChange} />
                </div>
              </Section>

              <Section title="Informações do Autor">
                <div style={styles.grid}>
                  <input style={styles.input} name="nome" placeholder="Nome" value={formAutor.nome || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="rg" placeholder="RG" value={formAutor.rg || ""} onChange={handleAutorChange} />
                  <input style={styles.input} type="date" name="dataNascimento" value={formAutor.dataNascimento || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="cpf" placeholder="CPF" value={formAutor.cpf || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="endereco" placeholder="Endereço" value={formAutor.endereco || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="perimetro" placeholder="Perímetro" value={formAutor.perimetro || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="bairro" placeholder="Bairro" value={formAutor.bairro || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="cidade" placeholder="Cidade" value={formAutor.cidade || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="estado" placeholder="Estado" value={formAutor.estado || ""} onChange={handleAutorChange} />
                  <input style={styles.input} name="contato" placeholder="Contato" value={formAutor.contato || ""} onChange={handleAutorChange} />
                  <input style={styles.input} type="time" name="horaVisita" value={formAutor.horaVisita || ""} onChange={handleAutorChange} />
                </div>

                <Sub title="Sexo" />
                <SimpleRadio field="sexo" form={formAutor} setForm={setFormAutor} options={["FEMININO", "MASCULINO", "OUTROS"]} />

                <Sub title="Etnia/Cor" />
                <SimpleRadio field="etniaCor" form={formAutor} setForm={setFormAutor} options={["BRANCA", "NEGRA", "PARDA", "ORIENTAL", "INDÍGENA"]} />

                <Sub title="Escolaridade" />
                <SimpleRadio field="escolaridade" form={formAutor} setForm={setFormAutor} options={["ENS. FUND. INC.", "ENS. FUND. COMP.", "ENS. MÉD. INCOMP.", "ENS. MÉD. COMP.", "ENS. SUP. INC.", "ENS. SUP. COMP.", "PÓS-GRAD."]} />

                <Sub title="Estado Civil" />
                <SimpleRadio field="estadoCivil" form={formAutor} setForm={setFormAutor} options={["CASADO", "UNIÃO ESTÁVEL", "SOLTEIRO", "DIVORCIADO", "VIÚVO", "OUTROS"]} />

                <Sub title="Grau de parentesco com a denunciante" />
                <SimpleRadio field="parentescoDenunciante" form={formAutor} setForm={setFormAutor} options={["ESPOSA", "EX CÔNJUGE", "NAMORADO", "MÃE", "FILHA", "MADRASTA", "EX NAMORADA", "OUTRO"]} />
                {formAutor.parentescoDenunciante === "OUTRO" && (
                  <input style={styles.input} name="outroParentesco" placeholder="Qual?" value={formAutor.outroParentesco || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Trabalha?" />
                <SimpleRadio field="trabalha" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.trabalha === "SIM" && (
                  <input style={styles.input} name="profissao" placeholder="Qual profissão?" value={formAutor.profissao || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Renda familiar" />
                <SimpleRadio field="rendaFamiliar" form={formAutor} setForm={setFormAutor} options={["MENOS DE UM SALÁRIO", "UM SALÁRIO", "MAIS DE UM SALÁRIO"]} />

                <Sub title="Possui filhos?" />
                <SimpleRadio field="filhos" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.filhos === "SIM" && (
                  <input style={styles.input} name="quantidadeFilhos" placeholder="Quantos?" value={formAutor.quantidadeFilhos || ""} onChange={handleAutorChange} />
                )}
                <input style={styles.input} name="filhosMoramComVoce" placeholder="Quantos moram com você?" value={formAutor.filhosMoramComVoce || ""} onChange={handleAutorChange} />

                <Sub title="Possui filhos com a denunciante?" />
                <SimpleRadio field="filhosDenunciante" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.filhosDenunciante === "SIM" && (
                  <input style={styles.input} name="quantidadeFilhosDenunciante" placeholder="Quantos?" value={formAutor.quantidadeFilhosDenunciante || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Participa de programa social?" />
                <SimpleRadio field="programaSocial" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.programaSocial === "SIM" && (
                  <input style={styles.input} name="qualProgramaSocial" placeholder="Qual?" value={formAutor.qualProgramaSocial || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Moradia" />
                <SimpleRadio field="moradia" form={formAutor} setForm={setFormAutor} options={["ALUGADA", "CEDIDA", "PRÓPRIA", "PRÓPRIA DE TERCEIROS", "OUTRAS"]} />
              </Section>

              <Section title="Uso de substâncias e saúde">
                <Sub title="Consome álcool?" />
                <SimpleRadio field="consomeAlcool" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.consomeAlcool === "SIM" && (
                  <input style={styles.input} name="quaisAlcool" placeholder="Quais?" value={formAutor.quaisAlcool || ""} onChange={handleAutorChange} />
                )}
                <SimpleRadio field="frequenciaAlcool" form={formAutor} setForm={setFormAutor} options={["SOMENTE EM OCASIÕES ESPECIAIS", "DIARIAMENTE", "NOS FINS DE SEMANA"]} />

                <Sub title="Consome outro tipo de droga?" />
                <SimpleRadio field="consomeDrogas" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.consomeDrogas === "SIM" && (
                  <input style={styles.input} name="quaisDrogas" placeholder="Quais?" value={formAutor.quaisDrogas || ""} onChange={handleAutorChange} />
                )}
                <SimpleRadio field="frequenciaDrogas" form={formAutor} setForm={setFormAutor} options={["SOMENTE EM OCASIÕES ESPECIAIS", "DIARIAMENTE", "NOS FINS DE SEMANA"]} />

                <Sub title="Faz tratamento para dependência química?" />
                <SimpleRadio field="tratamentoDependencia" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                <Sub title="Possui algum transtorno mental comprovado?" />
                <SimpleRadio field="transtornoMental" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                <Sub title="Faz uso de remédio controlado?" />
                <SimpleRadio field="remedioControlado" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                <Sub title="O autor ou familiares residem próximo da vítima?" />
                <SimpleRadio field="resideProximoVitima" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
              </Section>

              <Section title="Informações da Situação">
                <Sub title="Tem ciência da existência de medida protetiva em seu desfavor?" />
                <SimpleRadio field="cienteMedidaProtetiva" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />

                <Sub title="Quando foi a última vez que entrou em contato com a solicitante?" />
                <textarea style={styles.textarea} name="ultimoContatoSolicitante" value={formAutor.ultimoContatoSolicitante || ""} onChange={handleAutorChange} />

                <Sub title="De que forma o contato ocorreu?" />
                <Options>
                  {["TELEFONE", "REDE SOCIAL", "RESIDÊNCIA", "LOCAL DE TRABALHO", "OUTRO"].map((op) => (
                    <Check key={op} label={op} checked={formAutor.formaContato?.includes(op)} onChange={() => toggleAutor("formaContato", op)} />
                  ))}
                </Options>
                {formAutor.formaContato?.includes("OUTRO") && (
                  <input style={styles.input} name="outraFormaContato" placeholder="Qual?" value={formAutor.outraFormaContato || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Teve contato com os filhos?" />
                <SimpleRadio field="contatoFilhos" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM", "NÃO SE APLICA"]} />

                <Sub title="Como o contato com os filhos acontece?" />
                <textarea style={styles.textarea} name="comoContatoFilhos" value={formAutor.comoContatoFilhos || ""} onChange={handleAutorChange} />

                <Sub title="Com que frequência?" />
                <SimpleRadio field="frequenciaContato" form={formAutor} setForm={setFormAutor} options={["DIARIAMENTE", "SEMANALMENTE", "MENSALMENTE", "OUTROS"]} />
                {formAutor.frequenciaContato === "OUTROS" && (
                  <input style={styles.input} name="outraFrequenciaContato" placeholder="Descreva" value={formAutor.outraFrequenciaContato || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Possui antecedentes criminais?" />
                <SimpleRadio field="antecedentesCriminais" form={formAutor} setForm={setFormAutor} options={["NÃO", "SIM"]} />
                {formAutor.antecedentesCriminais === "SIM" && (
                  <input style={styles.input} name="quaisAntecedentes" placeholder="Qual?" value={formAutor.quaisAntecedentes || ""} onChange={handleAutorChange} />
                )}

                <Sub title="Observações Gerais" />
                <textarea style={styles.textarea} name="observacoesGerais" value={formAutor.observacoesGerais || ""} onChange={handleAutorChange} />
              </Section>

              <div style={styles.actions}>
                <button style={styles.btnCancel} onClick={() => setModalAutor(false)}>
                  Cancelar
                </button>

                <button
                  style={salvandoAutor ? styles.btnDisabled : styles.btnPrimary}
                  onClick={salvarAutor}
                  disabled={salvandoAutor}
                >
                  {salvandoAutor ? "Salvando..." : "Salvar Orientação"}
                </button>
              </div>
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
          atendimentosPaginados.map((item: any) => {
            const registro = item.registro
            const isAutor = item.tipo === "AUTOR"

            return (
              <div key={item.id} style={styles.card}>
                <strong>
                  {isAutor
                    ? registro.nome || registro.author?.nome || item.agenda?.author?.nome || "Autor não informado"
                    : registro.nome || item.agenda?.woman?.name || "-"}
                </strong>

                <div style={styles.statusArea}>
                  <span style={isAutor ? styles.statusNeutral : styles.statusOk}>
                    {isAutor
                      ? "Orientação ao autor"
                      : item.tipo === "ACOMPANHAMENTO"
                        ? "Acompanhamento"
                        : "Acolhimento"}
                  </span>
                </div>

                <p>Agenda: {item.agendaId || "-"}</p>

                <p>
                  Militares Envolvidos:{" "}
                  {item.agenda?.militares
                    ?.map((m: any) => `${m.police?.graduacao?.name} ${m.police?.user?.name}`)
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>

                <p>Data e Hora: {item.data ? new Date(item.data).toLocaleString("pt-BR") : "-"}</p>

                <p>
                  Militar que Preencheu:{" "}
                  {registro.police?.graduacao?.name || ""} {registro.police?.user?.name || ""}
                </p>

                {!isAutor && registro.tipoViolencia?.length > 0 && (
                  <p>Tipo de Violência: {registro.tipoViolencia.join(", ")}</p>
                )}

                {isAutor && (
                  <p>
                    Medida protetiva: {registro.cienteMedidaProtetiva || "-"} •
                    Antecedentes: {registro.antecedentesCriminais || "-"}
                  </p>
                )}

                <div style={styles.pdfActions}>
                  {item.tipo === "ACOLHIMENTO" && (
                    <button style={styles.btnPdf} onClick={() => gerarRelatorioAtendimento(registro)}>
                      PDF Acolhimento
                    </button>
                  )}

                  {item.tipo === "ACOMPANHAMENTO" && (
                    <button style={styles.btnPdf} onClick={() => gerarRelatorioAcompanhamento(registro)}>
                      PDF Acompanhamento
                    </button>
                  )}

                  {item.tipo === "AUTOR" && (
                    <button style={styles.btnPdf} onClick={() => gerarRelatorioAutor(registro)}>
                      PDF Orientação ao Autor
                    </button>
                  )}
                </div>
              </div>
            )
          })
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

function SimpleRadio({ field, form, setForm, options }: any) {
  return (
    <div style={styles.options}>
      {options.map((value: string) => (
        <label key={value}>
          <input
            type="radio"
            checked={form[field] === value}
            onChange={() => setForm({ ...form, [field]: value })}
          />
          {value}
        </label>
      ))}
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

  pdfActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
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
