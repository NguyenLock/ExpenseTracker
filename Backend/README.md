# ExpenseTracker API (Backend)

NestJS + PostgreSQL + TypeORM.

## Stack

- NestJS 12 / TypeScript
- PostgreSQL 16 (Docker)
- TypeORM
- `@nestjs/config`
- `class-validator` + `class-transformer` (global `ValidationPipe`)
- Oxlint + Prettier + Vitest

## Quick start

```bash
# 1. Start Postgres (needs Docker Desktop running)
npm run db:up

# 2. Install (if needed) and run API on :3001
npm install
npm run start:dev
```

- Health: [http://localhost:3001/health](http://localhost:3001/health)
- Swagger: [http://localhost:3001/docs](http://localhost:3001/docs)

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run start:dev` | API watch mode (port 3001) |
| `npm run build` | Compile |
| `npm run lint` / `npm run format` | Lint / format |
| `npm run test` | Unit tests |
| `npm run db:up` | Start Postgres |
| `npm run db:down` | Stop Postgres |
| `npm run db:logs` | Postgres logs |

## Env

Copy `.env.example` → `.env` (already created locally). Frontend CORS origin defaults to `http://localhost:3000`.
