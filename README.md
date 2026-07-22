![Financy logo](frontend/src/assets/logo.svg)

Aplicação web de controle financeiro pessoal. Cada usuário gerencia suas próprias categorias, registra receitas e despesas, acompanha um dashboard com resumos mensais e mantém seu perfil — tudo em português, com formatação de moeda e datas em `pt-BR`.

## Estrutura de entrega

```
financy/
├── backend/    # API GraphQL
└── frontend/   # SPA React
```

Schemas Zod e códigos de erro compartilhados ficam em `backend/shared/` e são consumidos pelos dois pacotes via dependência local.

## Funcionalidades

| Área | O que faz |
|------|-----------|
| **Autenticação** | Cadastro, login com "lembrar de mim" e renovação automática de token |
| **Dashboard** | Saldo total, receitas/despesas do mês e transações recentes |
| **Transações** | Criar, editar e excluir receitas e despesas com filtros e paginação |
| **Categorias** | Categorias personalizadas com nome, ícone, cor e descrição |
| **Perfil** | Atualizar nome, visualizar e-mail e encerrar sessão |

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 19, Vite 8, React Router 8, Apollo Client 4, Tailwind CSS 4, shadcn/ui |
| Backend | Express 5, Apollo Server 5, type-graphql, Prisma 7, SQLite |
| Qualidade | TypeScript 7, Vitest 4, Biome |

## Pré-requisitos

- **Node.js** 20 LTS ou superior (recomendado)
- **pnpm** 9 ou superior
- **Git**
- **Toolchain nativa de C++** — necessária para compilar `better-sqlite3` (Xcode Command Line Tools no macOS, `build-essential` no Linux)

Não é necessário Docker, PostgreSQL nem nenhum serviço externo. O banco é SQLite local.

## Primeiros passos

### 1. Clonar o repositório

```bash
git clone git@github.com:miguelriosoliveira/financy.git
cd financy
```

### 2. Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP do servidor |
| `JWT_SECRET` | Segredo para assinar tokens JWT |
| `DATABASE_URL` | URL SQLite no formato `file:./dev.db` |

O arquivo `backend/.env.test` já está versionado com valores seguros para a suíte de testes.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

```env
VITE_BACKEND_URL=http://localhost:3000/graphql
```

### 4. URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend (GraphQL) | http://localhost:3000/graphql |

### 5. Health check

```graphql
query {
  health
}
```

Resposta esperada: `"ok"`.

## Scripts

### Backend (`cd backend`)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor com hot reload |
| `pnpm build` | Bundle de produção (`dist/`) |
| `pnpm start` | Executa o build de produção |
| `pnpm test` | Todos os testes |
| `pnpm test:unit` | Testes unitários (sem banco) |
| `pnpm test:integration` | Testes de integração (com SQLite) |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm typecheck` | Verificação de tipos TypeScript |
| `pnpm lint` | Formata e corrige com Biome |
| `pnpm db:migrate` | Aplica migrations (desenvolvimento) |
| `pnpm db:generate` | Regenera o client Prisma |
| `pnpm db:studio` | Abre o Prisma Studio |
| `pnpm schema:generate` | Regenera `schema.graphql` |

### Frontend (`cd frontend`)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor Vite com HMR |
| `pnpm build` | Build de produção |
| `pnpm preview` | Pré-visualiza o build |
| `pnpm test` | Todos os testes |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm typecheck` | Verificação de tipos TypeScript |
| `pnpm lint` | Formata e corrige com Biome |

## Banco de dados

O projeto usa **SQLite** via Prisma.

| Arquivo | Uso |
|---------|-----|
| `backend/dev.db` | Desenvolvimento (criado por `db:migrate`) |
| `backend/test.db` | Testes de integração (criado automaticamente) |

Após alterar `schema.prisma`:

```bash
cd backend
pnpm db:migrate
pnpm db:generate
```

## Testes

### Backend

- **Unitários** (`src/services/`, `src/utils/`) — dependências mockadas, sem banco
- **Integração** (`src/tests/`) — servidor Express real com SQLite de teste

### Frontend

Vitest com jsdom e Testing Library. Use o helper `renderWithProviders` de `frontend/src/tests/helpers/render.tsx`.

### Fluxo de qualidade

Dentro de cada pasta:

```bash
cd backend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## API GraphQL

O schema canônico está em [`backend/schema.graphql`](backend/schema.graphql). Após alterar resolvers ou tipos GraphQL:

```bash
cd backend && pnpm schema:generate
```

**Operações públicas:** `health`, `register`, `login`, `refreshToken`

**Operações autenticadas:** `getMe`, `updateProfile`, CRUD de categorias e transações, `getDashboardSummary`, `getTransactionPeriods`

Autenticação via header `Authorization: Bearer <token>`.

## Solução de problemas

| Problema | Solução |
|----------|---------|
| Erro ao instalar `better-sqlite3` | Instale a toolchain nativa de C++ (Xcode CLT no macOS) |
| Backend não inicia | Verifique se `backend/.env` tem `PORT`, `JWT_SECRET` e `DATABASE_URL=file:./...` preenchidos |
| Frontend não conecta ao backend | Confirme que `VITE_BACKEND_URL` aponta para a porta correta do backend |
| Tabelas não existem | Rode `cd backend && pnpm db:migrate` |
| `schema.graphql` desatualizado | Rode `cd backend && pnpm schema:generate` após mudanças nos resolvers |
