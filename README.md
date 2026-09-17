# ExpenseTracker

Monorepo: Next.js frontend + NestJS API.

## Setup

```bash
npm install
cp Backend/.env.example Backend/.env
npm run db:up
```

## Run both apps

```bash
npm run start
```

Opens **mprocs** TUI with `api` + `web` side by side.

| Key | Action |
|-----|--------|
| `↑` / `↓` or `k` / `j` | Switch between api / web |
| `Ctrl+A` | Toggle focus list ↔ output |
| `r` | Restart selected process |
| `x` | Stop selected process |
| `q` | Quit all |

- Frontend: http://localhost:3000  
- Backend: http://localhost:3001  
- Swagger: http://localhost:3001/docs  

## Other scripts

| Command | What |
|---------|------|
| `npm run start` / `npm run dev` | API + web (mprocs TUI) |
| `npm run build` | Build both |
| `npm run db:up` | Start Postgres |
| `npm run db:down` | Stop Postgres |
