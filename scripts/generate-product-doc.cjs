const fs = require("fs")
const path = require("path")
const { jsPDF } = require("jspdf")
const autoTable = require("jspdf-autotable").default

const root = path.resolve(__dirname, "..")
const output = path.join(root, "docs", "SOS-Maria-Documentacao-Tecnica.pdf")
const logoPath = path.join(root, "public", "sos2.png")
const pmpaPath = path.resolve(root, "..", "MARIA", "img", "pmpa.png")

function imageData(file) {
  return fs.readFileSync(file).toString("base64")
}

const doc = new jsPDF({ unit: "mm", format: "a4" })
const pageWidth = doc.internal.pageSize.getWidth()
const pageHeight = doc.internal.pageSize.getHeight()
const margin = 16
let y = 0

const logo = imageData(logoPath)
const pmpa = imageData(pmpaPath)

function addImageContain(image, sourceWidth, sourceHeight, x, yPosition, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight)
  const width = sourceWidth * scale
  const height = sourceHeight * scale

  doc.addImage(
    image,
    "PNG",
    x + (maxWidth - width) / 2,
    yPosition + (maxHeight - height) / 2,
    width,
    height
  )
}

function addHeader(title = "SOS Maria - Documentação Técnica") {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, 23, "F")
  addImageContain(pmpa, 431, 579, 12, 2, 16, 18)
  addImageContain(logo, 612, 408, pageWidth - 42, 3, 30, 17)
  doc.setTextColor(142, 36, 170)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(title, pageWidth / 2, 12, { align: "center" })
  doc.setDrawColor(142, 36, 170)
  doc.setLineWidth(0.6)
  doc.line(margin, 23, pageWidth - margin, 23)
  doc.setTextColor(33, 33, 33)
  y = 32
}

function addFooter() {
  const page = doc.getNumberOfPages()
  doc.setDrawColor(230, 230, 230)
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`SOS Maria - Documento técnico | Página ${page}`, pageWidth / 2, pageHeight - 8, { align: "center" })
  doc.setTextColor(33, 33, 33)
}

function newPage(title) {
  addFooter()
  doc.addPage()
  addHeader(title)
}

function ensureSpace(height, title) {
  if (y + height > pageHeight - 22) {
    newPage(title)
  }
}

function section(title) {
  ensureSpace(14, title)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(142, 36, 170)
  doc.text(title, margin, y)
  y += 8
  doc.setDrawColor(142, 36, 170)
  doc.line(margin, y - 3, pageWidth - margin, y - 3)
  doc.setTextColor(33, 33, 33)
}

function paragraph(text) {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
  ensureSpace(lines.length * 5 + 3, "SOS Maria - Documentação Técnica")
  doc.text(lines, margin, y)
  y += lines.length * 5 + 3
}

function bullets(items) {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  items.forEach((item) => {
    const lines = doc.splitTextToSize(String(item), pageWidth - margin * 2 - 5)
    ensureSpace(lines.length * 5 + 2, "SOS Maria - Documentação Técnica")
    doc.text("-", margin, y)
    doc.text(lines, margin + 5, y)
    y += lines.length * 5 + 2
  })
  y += 2
}

function table(head, body, title = "SOS Maria - Documentação Técnica") {
  ensureSpace(30, title)
  const initialPage = doc.getNumberOfPages()

  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { top: 32, bottom: 22, left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2.2, valign: "top" },
    headStyles: { fillColor: [142, 36, 170], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 245, 252] },
    didDrawPage: () => {
      if (doc.getNumberOfPages() > initialPage) {
        addHeader(title)
      }
      addFooter()
    }
  })
  y = doc.lastAutoTable.finalY + 8
}

function cover() {
  doc.setFillColor(250, 245, 252)
  doc.rect(0, 0, pageWidth, pageHeight, "F")
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(14, 14, pageWidth - 28, 48, 3, 3, "F")
  addImageContain(pmpa, 431, 579, 25, 18, 28, 38)
  addImageContain(logo, 612, 408, pageWidth - 67, 20, 42, 32)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(90, 90, 90)
  doc.text("POLÍCIA MILITAR DO PARÁ", 39, 59, { align: "center" })
  doc.text("SOS MARIA", pageWidth - 46, 59, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setTextColor(142, 36, 170)
  doc.setFontSize(25)
  doc.text("SOS Maria", pageWidth / 2, 78, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(70, 70, 70)
  doc.text("Documentação Técnica do Produto", pageWidth / 2, 88, { align: "center" })

  doc.setDrawColor(142, 36, 170)
  doc.setLineWidth(0.8)
  doc.line(45, 96, pageWidth - 45, 96)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  const subtitle =
    "Sistema integrado para proteção, acompanhamento e gestão de mulheres vítimas de violência doméstica, com módulo web, aplicativo móvel, API, notificações e relatórios gerenciais."
  doc.text(doc.splitTextToSize(subtitle, 145), pageWidth / 2, 111, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(33, 33, 33)
  doc.text("Equipe do Projeto", pageWidth / 2, 146, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("1º TEN PM - DENIS WASHINGTON FERREIRA MENDES", pageWidth / 2, 156, { align: "center" })
  doc.text("Gerente de Projeto & Coordenador Operacional", pageWidth / 2, 162, { align: "center" })
  doc.text("2º SGT PM - JOSÉ NILSON SILVA DOS SANTOS", pageWidth / 2, 174, { align: "center" })
  doc.text("Arquiteto de Software e Desenvolvedor Full Stack, com atuação em Cibersegurança", pageWidth / 2, 180, { align: "center" })

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(`Versão 1.0 | Gerado em ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, 232, { align: "center" })
  doc.text("Polícia Militar do Pará | Ecossistema SOS Maria", pageWidth / 2, 240, { align: "center" })
}

cover()
newPage("SOS Maria - Visão Geral")

section("1. Visão Geral do Produto")
paragraph(
  "O SOS Maria é um ecossistema digital voltado ao gerenciamento operacional e estratégico do atendimento a mulheres vítimas de violência doméstica. A solução integra cadastro de assistidas, monitoramento de pedidos de ajuda, gestão de agendas policiais, formulários de acolhimento e acompanhamento, orientação de autores, relatórios gerenciais, aplicativo móvel e notificações."
)
bullets([
  "Centralizar informações de assistidas, autores, municípios, unidades e efetivo policial.",
  "Permitir que mulheres acionem pedido de ajuda com geolocalização pelo aplicativo.",
  "Notificar gestores responsáveis conforme município e perfil de acesso.",
  "Apoiar tomada de decisão com relatórios, métricas, históricos e indicadores demográficos.",
  "Registrar visitas com formulários padronizados de acolhimento, acompanhamento e orientação do autor."
])

section("2. Perfis de Acesso")
table(
  ["Perfil", "Responsabilidades", "Restrições"],
  [
    ["SUPER_ADMIN", "Acesso global ao sistema, relatórios, emergências, municípios, unidades, autores, mulheres e efetivo.", "Visualiza todos os municípios e unidades."],
    ["ADMIN", "Gestão operacional do município/unidade, acompanhamento de mulheres, emergências e relatórios locais.", "Restrito ao municipalityId e unidadeId vinculados."],
    ["POLICE", "Consulta agendas em que está escalado e preenche formulários de visita.", "Restrito às escalas atribuídas."],
    ["WOMAN", "Uso do aplicativo móvel: pedido de ajuda, diário de emoções, mapa e acompanhamento.", "Sem acesso ao sistema web."]
  ]
)

section("3. Arquitetura Técnica")
table(
  ["Camada", "Tecnologia", "Descrição"],
  [
    ["Frontend Web", "React, TypeScript, Vite", "Sistema de gestão para administradores, gestores e policiais."],
    ["Aplicativo Móvel", "Expo SDK 53, React Native", "Aplicativo para mulher assistida, gestores e notificações móveis."],
    ["Backend API", "Node.js, Express, TypeScript", "API REST com autenticação JWT, regras de acesso e integrações."],
    ["ORM e Banco", "Prisma ORM, PostgreSQL", "Persistência de usuários, agendas, emergências, formulários e relatórios."],
    ["Tempo Real", "Socket.IO", "Atualização de pedidos de ajuda na tela de emergências."],
    ["Mapas", "Leaflet, React Leaflet, React Native Maps", "Visualização de ocorrências e mapas de calor."],
    ["Notificações", "Expo Notifications, FCM V1", "Push remoto e notificações locais agendadas."],
    ["PDF", "jsPDF, AutoTable", "Relatórios do dashboard, efetivo, atendimentos e orientações."]
  ]
)

section("4. Módulos Funcionais")
bullets([
  "Dashboard gerencial com métricas de assistidas, pedidos de ajuda, visitas, autores e municípios.",
  "Cadastro e gestão de mulheres assistidas com dados demográficos: idade, raça, cor, escolaridade e bairro.",
  "Cadastro e gestão de autores/agressores vinculados à mulher assistida.",
  "Agenda de visitas para mulher, autor ou ambos, com escala de militares.",
  "Formulário de acolhimento aplicado apenas na primeira visita da assistida.",
  "Formulário de acompanhamento aplicado em todas as visitas da assistida.",
  "Formulário de orientação do autor com campos específicos do atendimento ao autor.",
  "Encerramento de agenda por assistida/autor não encontrado, com justificativa.",
  "Atendimentos realizados agrupados por agenda, mantendo formulários da mesma visita juntos.",
  "Módulo de emergências com mapa, acordeão, socket e alerta sonoro/visual.",
  "Relatórios em tela e PDF para perfis SUPER_ADMIN e ADMIN conforme escopo territorial."
])

newPage("SOS Maria - API e Integrações")
section("5. API REST e Swagger")
paragraph(
  "A API expõe documentação OpenAPI 3.0 nas rotas /openapi.json e /swagger.json, além da interface interativa /docs. A autenticação utiliza JWT no cabeçalho Authorization: Bearer <token>. As regras de negócio são aplicadas por perfil e por vínculo territorial."
)
table(
  ["Grupo", "Rotas Principais", "Finalidade"],
  [
    ["Autenticação", "/auth/login, /auth/mfa/verify", "Login, MFA e emissão de token."],
    ["Usuários", "/users, /users/{id}, /users/push-token", "Cadastro, listagem, edição, status ativo e pushToken."],
    ["Emergências", "/emergencies, /emergencies/{id}/status", "Pedido de ajuda, atendimento e histórico."],
    ["Agenda", "/agenda, /agenda/police, /agenda/not-found", "Escalas, visitas pendentes e encerramento por não encontrado."],
    ["Formulários", "/appointment/atendimentos, /appointment/acompanhamentos, /appointment/author-orientations", "Acolhimento, acompanhamento e orientação do autor."],
    ["Autores", "/authors", "Cadastro, edição, listagem e exclusão de autores."],
    ["Estrutura", "/municipalities, /unidades, /graduações, /police", "Municípios, unidades, graduações e efetivo."],
    ["App Mulher", "/daily-emotions, /visit-requests, /parents", "Diário emocional, pedidos de visita e responsáveis."]
  ]
)

section("6. Notificações")
bullets([
  "Pedido de ajuda: enviado para ADMIN do mesmo município da mulher e para SUPER_ADMIN.",
  "Agenda criada: enviada para a mulher informando data e hora da visita.",
  "Diário de emoções: notificação local diária às 08h para mulheres registrarem o estado emocional.",
  "Canais Android: sos-maria-alerts, scheduled-visits e daily-emotions.",
  "Infraestrutura: Expo Notifications com credenciais FCM V1 configuradas no EAS."
])

section("7. Segurança")
bullets([
  "Autenticação por CPF e senha com JWT.",
  "MFA no sistema web com QR Code para Google Authenticator ou aplicativo compatível.",
  "Bloqueio de acesso web para perfil WOMAN.",
  "Controle territorial: ADMIN limitado a municipalityId e unidadeId.",
  "Controle operacional: POLICE visualiza agendas em que está escalado.",
  "Desabilitação lógica de mulheres assistidas por campo isActive.",
  "Tratamento visual de erros de API via toast no frontend."
])

section("8. Banco de Dados e Entidades")
table(
  ["Entidade", "Descrição"],
  [
    ["User", "Usuários do sistema, mulheres assistidas, administradores e policiais."],
    ["Police", "Perfil policial vinculado a usuário, graduação e unidade."],
    ["Municipality / Unidade", "Estrutura territorial e operacional."],
    ["Emergency", "Pedido de ajuda com geolocalização e status."],
    ["Agenda", "Visita agendada para mulher, autor ou ambos, com militares escalados."],
    ["Atendimento", "Formulário de acolhimento da assistida."],
    ["Acompanhamento", "Formulário de acompanhamento de visitas."],
    ["Author", "Autor/agressor vinculado à mulher assistida."],
    ["AuthorOrientation", "Formulário de orientação do autor."],
    ["DailyEmotion", "Registro emocional diário enviado pelo aplicativo."]
  ]
)

newPage("SOS Maria - Operação e Implantação")
section("9. Regras Operacionais")
bullets([
  "Na primeira visita da assistida, o acolhimento deve ser preenchido antes do acompanhamento.",
  "A partir da segunda visita, apenas o acompanhamento fica disponível.",
  "Se a assistida ou autor não for encontrado, a equipe registra a justificativa e encerra a agenda.",
  "Atendimentos realizados agrupam formulários pertencentes à mesma agenda.",
  "O SUPER_ADMIN acessa todos os dados; o ADMIN acessa apenas seu município e unidade.",
  "Pedidos de ajuda devem aparecer em tempo real na tela de emergências e disparar alerta visual/sonoro."
])

section("10. Implantação")
table(
  ["Componente", "Procedimento"],
  [
    ["Backend", "Executar npm install, npx prisma generate, npx prisma migrate deploy, npm run build e npm start."],
    ["Frontend Web", "Executar npm install e npm run build; publicar pasta dist."],
    ["App Expo", "Configurar google-services.json, FCM V1 no EAS e gerar build com eas build -p android --profile preview/production --clear-cache."],
    ["Banco", "Aplicar migrations Prisma em ambiente de produção antes de iniciar a nova versão."],
    ["Swagger", "Acessar /docs para interface interativa e /openapi.json para integrações."]
  ]
)

section("11. Relatórios e PDFs")
bullets([
  "Dashboard com impressão consolidada dos indicadores visíveis.",
  "PDF do efetivo com identidade visual padronizada.",
  "PDFs individuais de acolhimento, acompanhamento e orientação do autor.",
  "Relatórios em tela por município, período, mulheres, autores, pedidos de ajuda, visitas e dados demográficos.",
  "Agrupamento de formulários por agenda para manter rastreabilidade operacional."
])

section("12. Equipe e Governança")
table(
  ["Papel", "Responsável", "Atribuições"],
  [
    ["Gerente de Projeto & Coordenador Operacional", "1º TEN PM - DENIS WASHINGTON FERREIRA MENDES", "Direcionamento institucional, priorização, validação operacional e articulação com stakeholders."],
    ["Arquiteto de Software e Desenvolvedor Full Stack, com atuação em Cibersegurança", "2º SGT PM - JOSÉ NILSON SILVA DOS SANTOS", "Análise de requisitos, arquitetura, desenvolvimento web/mobile/API, banco de dados, integrações, relatórios, cibersegurança e suporte técnico."],
    ["Usuários Gestores", "SUPER_ADMIN e ADMIN", "Operação, acompanhamento de indicadores, validação de cadastros e resposta a ocorrências."],
    ["Equipe Operacional", "Policiais escalados", "Execução das visitas e preenchimento dos formulários oficiais."]
  ]
)

section("13. Considerações Finais")
paragraph(
  "O SOS Maria consolida uma plataforma operacional e gerencial para ampliar a capacidade de acompanhamento, resposta e tomada de decisão na proteção de mulheres em situação de violência doméstica. A evolução recomendada inclui trilhas de auditoria, painel de SLA de emergências, dashboards preditivos com base no diário emocional e melhoria contínua dos fluxos de atendimento."
)

addFooter()
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")))
console.log(`PDF gerado em: ${output}`)
