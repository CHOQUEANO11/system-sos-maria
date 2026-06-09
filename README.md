# SOS Maria - Sistema Web de Gestão

Sistema web administrativo do ecossistema **SOS Maria**, criado para gerenciar o acompanhamento de mulheres em situação de violência doméstica, pedidos de ajuda, visitas policiais, autores/agressores, efetivo e relatórios gerenciais.

## Visão Geral

O frontend atende os perfis administrativos e operacionais do SOS Maria:

- `SUPER_ADMIN`: acesso global a municípios, unidades e registros;
- `ADMIN`: acesso limitado ao município e à unidade vinculados;
- `POLICE`: acesso às agendas em que o militar está escalado;
- `WOMAN`: sem acesso ao sistema web, utilizando o aplicativo mobile.

O sistema consome a API REST do SOS Maria e recebe atualizações de emergências em tempo real por Socket.IO.

## Funcionalidades

### Dashboard

- Indicadores de mulheres, autores, administradores e emergências;
- Total de visitas de assistidas no mês;
- Visitas por mulher com busca e paginação;
- Emergências e visitas por município;
- Visitas de autores por município;
- Mapa de calor dos pedidos de ajuda;
- Impressão consolidada do dashboard em PDF.

### Mulheres Assistidas

- Cadastro e edição;
- Dados demográficos: idade, raça, cor, escolaridade e bairro;
- Seleção de município e unidade;
- Busca independente da paginação;
- Visualização de visitas, policiais responsáveis e pedidos de ajuda;
- Ativação e desativação de cadastro;
- Restrição territorial para administradores.

### Autores/Agressores

- Cadastro completo do autor;
- Vínculo com mulher assistida;
- Busca, paginação, edição e exclusão;
- Geração de PDF;
- Utilização do autor nas agendas e formulários de orientação.

### Agenda e Atendimentos

- Criação de agenda para mulher ou autor;
- Seleção do efetivo escalado;
- Ordenação das escalas mais recentes;
- Acolhimento somente na primeira visita;
- Acompanhamento em todas as visitas;
- Formulário específico de orientação ao autor;
- Encerramento como assistida ou autor não encontrado;
- Histórico por mulher;
- Paginação dos formulários por mulher;
- PDFs individuais e consolidados.

### Emergências

- Pedidos de ajuda em tempo real com Socket.IO;
- Alerta visual e sonoro;
- Mapa em formato de acordeão;
- Direcionamento para o Google Maps;
- Marcação como atendido;
- Tempo decorrido até o atendimento;
- Exclusão com confirmação para `ADMIN` e `SUPER_ADMIN`.

### Solicitações de Visita

- Listagem dos pedidos pendentes;
- Marcação como recebido;
- Remoção automática da lista de pendentes;
- Notificação push enviada à mulher após o recebimento.

### Relatórios

- Mulheres e autores por município;
- Perfil demográfico;
- Pedidos de ajuda por período;
- Visitas de mulheres e autores;
- Visitas mensais por mulher com gráfico, busca e paginação;
- Atendimentos por policial;
- Tipos de violência;
- PDFs da consulta respeitando filtros e escopo territorial.

### Estrutura Administrativa

- Administradores;
- Municípios;
- Unidades;
- Efetivo policial;
- Graduações;
- Perfil do usuário.

## Tecnologias

- React 19;
- TypeScript;
- Vite;
- React Router;
- Axios;
- Socket.IO Client;
- Leaflet e React Leaflet;
- Recharts;
- jsPDF e jsPDF AutoTable;
- React Toastify;
- Lucide React.

## Estrutura

```text
gestao-sos-full/
├── public/
├── docs/
├── scripts/
│   └── generate-product-doc.cjs
├── src/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── package.json
└── vite.config.ts
```

## Páginas

| Rota | Página | Finalidade |
|---|---|---|
| `/` | Login | Autenticação e MFA |
| `/dashboard` | Dashboard | Indicadores e gráficos |
| `/admins` | Administradores | Gestão de administradores |
| `/women` | Mulheres | Gestão das assistidas |
| `/authors` | Autores | Gestão dos autores/agressores |
| `/efetivo` | Efetivo | Gestão dos policiais |
| `/agenda-create` | Criar agenda | Criação de visitas |
| `/agenda-police` | Minhas visitas | Formulários e histórico |
| `/emergencies` | Emergências | Pedidos de ajuda |
| `/visitRequest` | Solicitações | Pedidos de visita |
| `/reports` | Relatórios | Consultas, gráficos e PDFs |
| `/municipalities` | Municípios | Gestão territorial |
| `/units` | Unidades | Gestão de unidades |
| `/profile` | Perfil | Dados do usuário |

## Pré-requisitos

- Node.js LTS;
- npm;
- API SOS Maria executando localmente ou publicada.

## Instalação

```bash
npm install
```

## Configuração da API

A URL da API está configurada em:

```text
src/services/api.ts
```

Para desenvolvimento local:

```ts
export const api = axios.create({
  baseURL: "http://localhost:3000"
})
```

Para produção, utilize uma URL HTTPS.

## Execução

Servidor de desenvolvimento:

```bash
npm run dev
```

O Vite informará a URL local, normalmente:

```text
http://localhost:5173
```

## Validação

Build de produção:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Pré-visualização do build:

```bash
npm run preview
```

## Autenticação

- O login recebe o token JWT da API;
- O token e o usuário são armazenados no `localStorage`;
- O interceptor Axios envia `Authorization: Bearer <token>`;
- Rotas privadas utilizam `PrivateRoute`;
- Mulheres não devem acessar o sistema web;
- O login web possui suporte a MFA com código TOTP.

## Regras de Acesso

- `SUPER_ADMIN` visualiza todos os municípios e unidades;
- `ADMIN` visualiza somente seu `municipalityId` e `unidadeId`;
- `POLICE` visualiza apenas agendas em que está escalado;
- A API deve validar novamente todas as permissões. Restrições somente no frontend não substituem autorização no backend.

## Tempo Real

A tela de emergências conecta-se ao Socket.IO da API e escuta eventos como:

- `emergency-created`;
- `emergency-updated`.

Ao receber uma emergência, a tela atualiza a lista, exibe toast e dispara alerta sonoro.

## PDFs

O sistema utiliza `jsPDF` e `jspdf-autotable` para gerar:

- Relatório do dashboard;
- Relatórios filtrados;
- Efetivo policial;
- Acolhimento;
- Acompanhamento;
- Orientação do autor.

Documentação técnica do produto:

```text
docs/SOS-Maria-Documentacao-Tecnica.pdf
```

Regeneração:

```bash
node scripts/generate-product-doc.cjs
```

## Deploy

1. Configure a URL de produção da API;
2. Execute `npm run build`;
3. Publique o conteúdo da pasta `dist`;
4. Configure redirecionamento de rotas SPA para `index.html`;
5. Garanta HTTPS e CORS compatível na API.

## Segurança

- Não exponha senhas, tokens ou chaves no repositório;
- Utilize HTTPS em produção;
- Mantenha autorização territorial também na API;
- Evite registrar dados pessoais sensíveis no console;
- Revise dependências e permissões periodicamente;
- Restrinja CORS no ambiente de produção.

## Solução de Problemas

### API não responde

- Confirme a URL em `src/services/api.ts`;
- Verifique se a API está ativa;
- Confira CORS e o token JWT;
- Analise a aba Network do navegador.

### Socket.IO não conecta

- Confirme que a API foi iniciada pelo `src/server.ts`;
- Verifique se a URL do Axios aponta para o mesmo servidor Socket.IO;
- Confira regras de proxy, HTTPS e CORS.

### Build apresenta chunk grande

O Vite pode avisar sobre chunks maiores que 500 kB. O sistema continua compilando, mas pode ser otimizado futuramente com imports dinâmicos e divisão manual de chunks.

## Equipe

- **Gerente de Projeto e Coordenador Operacional:** 1º TEN PM Denis Washington Ferreira Mendes;
- **Arquiteto de Software e Desenvolvedor Full Stack, com atuação em Cibersegurança:** 2º SGT PM José Nilson Silva dos Santos.

## Licença e Uso

Projeto destinado ao ecossistema SOS Maria e às atividades institucionais autorizadas.
