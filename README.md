# ExpenseTracker

A personal finance app for tracking income and expenses across wallets, setting monthly budgets, managing installment debts, and planning saving goals.

Built as an npm workspaces monorepo: **Next.js** frontend + **NestJS** API + **PostgreSQL**.

---

## Features

### Authentication
- Register / login with **HttpOnly JWT cookies** (access + refresh)
- Token rotation on refresh; logout revokes the refresh token

### Wallets
- Cash, bank, and e-wallet balances
- Transfer money between wallets

### Categories & transactions
- Income / expense categories with icons
- Create, edit, filter transactions (including date ranges: today, yesterday, custom)
- Transaction **shortcuts** (templates) for one-tap recurring entries

### Budgets
- Monthly limits per category or an **overall** monthly cap
- Spent vs limit with progress
- Copy budgets to the next month

### Debts
- Track money you owe or money owed to you
- Optional **installment plans** (e.g. Shopee Pay–style): monthly amount, pay window (day range), auto-close when paid off
- Settle one installment at a time; optional auto-record for receivables

### Saving goals
- Target amount, optional deadline, progress (`saved` / `target`)
- **Contribute**: deduct from a wallet, create an expense transaction, bump saved amount
- **Fixed costs** (e.g. rent) stored once for planning
- **Plan**: given monthly income, compute remaining, required monthly save, commitments (fixed costs + open “I owe” debts), and scenarios (`on track` / stretch / defer deadline)

### Dashboard
- Period summary (income, expense, savings, wallet total)
- Debt reminders, budget overview, active goals strip, recent transactions

---

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js (App Router), React, TypeScript, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeORM, PostgreSQL, class-validator, Swagger |
| Auth | JWT in HttpOnly cookies (Passport) |
| Tooling | npm workspaces, mprocs (run API + web together), Docker Compose for Postgres |

### Architecture notes

- **Frontend**: feature-based folders (`features/<name>/{api,hooks,components,schemas,types}`)
- **Backend**: Nest modules under `Backend/src/modules/` (`auth`, `wallets`, `transactions`, `budgets`, `debts`, `goals`, `dashboard`, …)
- Business rules stay in services; UI talks to HTTP APIs only

---

## Repository layout

```
ExpenseTracker/
├── Frontend/          # @expense-tracker/web  → http://localhost:3000
├── Backend/           # @expense-tracker/api  → http://localhost:3001
├── mprocs.yaml        # api + web process config
├── package.json       # workspace root scripts
└── README.md
```

Workspace links (do **not** commit or delete from Source Control):

- `node_modules/@expense-tracker/api` → `Backend`
- `node_modules/@expense-tracker/web` → `Frontend`

---

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm 10+

---

## Setup

```bash
# From repo root
npm install

cp Backend/.env.example Backend/.env
# Edit Backend/.env — DB_*, JWT secrets, FRONTEND_URL

# Frontend API URL (if missing)
# Frontend/.env.local → NEXT_PUBLIC_API_URL=http://localhost:3001

npm run db:up
```

Example `Backend/.env` keys:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `3001`) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Postgres |
| `FRONTEND_URL` | CORS origin (`http://localhost:3000`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Cookie JWT secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes |

---

## Run

```bash
npm run start
# or: npm run dev
```

Opens an **mprocs** TUI with `api` and `web`.

| Key | Action |
|-----|--------|
| `↑` / `↓` or `k` / `j` | Switch process |
| `Ctrl+A` | Toggle focus list ↔ output |
| `r` | Restart selected process |
| `x` | Stop selected process |
| `q` | Quit all |

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001 |
| Health | http://localhost:3001/health |
| Swagger | http://localhost:3001/docs |

Run only one side:

```bash
npm run start:dev -w @expense-tracker/api
npm run dev -w @expense-tracker/web
```

---

## Scripts (root)

| Command | Description |
|---------|-------------|
| `npm run start` / `npm run dev` | API + web via mprocs |
| `npm run build` | Build API and web |
| `npm run lint` | Lint both workspaces |
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres |
| `npm run db:logs` | Tail Postgres logs |

If `mprocs: command not found` after a pull, run `npm install` at the repo root again.

---

## Main API areas

All authenticated routes use the access-token cookie unless noted.

| Module | Base path | Highlights |
|--------|-----------|------------|
| Auth | `/auth` | register, login, refresh, logout |
| Users | `/users/me` | current user |
| Categories | `/categories` | CRUD |
| Wallets | `/wallets` | CRUD + `POST /wallets/transfer` |
| Transactions | `/transactions` | CRUD + date filters |
| Templates | `/transaction-templates` | shortcuts |
| Budgets | `/budgets` | monthly limits + `POST /budgets/copy` |
| Debts | `/debts` | installments, settle, reminders |
| Goals | `/goals` | CRUD, contribute, plan |
| Fixed costs | `/fixed-costs` | rent-like monthly commitments |
| Dashboard | `/dashboard` | overview aggregates |

Full request/response shapes: **Swagger** at `/docs`.

---

## Typical user flow

1. Register / sign in  
2. Create wallets and categories  
3. Log transactions (or use shortcuts)  
4. Set monthly budgets  
5. Add debts (one-shot or installments)  
6. Create a saving goal → set fixed costs (rent) → **Plan** with salary → **Contribute** from a wallet when ready  

---

## Design principles

- Clean, product-style UI (Linear / Vercel / Stripe Dashboard–inspired): Inter, primary `#2563EB`, light surfaces, minimal chrome  
- Money inputs use thousand separators (e.g. `1.200.000`) for readability  
- Saving-goal **Plan** is deterministic math first; LLM advice is optional / future  

---

## License

Private project — all rights reserved unless otherwise stated.
