# FirewallSign — Sistema de Assinaturas de Planos de Firewall

Sistema web para gerenciar clientes, planos de firewall, assinaturas e relatórios.

## Stack

- Backend: Node.js + Express + Prisma 6 + SQLite
- Frontend: Next.js 14 + React + TypeScript

## Estrutura

```txt
DesafioIntegrador2026-main/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── prisma/client.js
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend-next/
    ├── src/app/
    ├── src/components/
    ├── src/lib/api.ts
    ├── .env.local.example
    └── package.json
```

## Importante

Use preferencialmente **Node 20 LTS** ou **Node 22 LTS**.

Se você estiver usando Node 24 e der erro estranho com Prisma, instale o Node 22 LTS.

## Como rodar o backend

Abra um terminal na pasta do projeto e rode:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
npm run dev
```

O backend deve subir em:

```txt
http://localhost:3001
```
## Como rodar o frontend

Abra outro terminal, sem fechar o backend:

```bash
cd frontend-next
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

## Variáveis de ambiente

### Backend — `backend/.env`

O arquivo já está incluído no ZIP com este conteúdo:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3001
```

### Frontend — `frontend-next/.env.local`

Se quiser, crie esse arquivo com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Caso não crie, o frontend já usa `http://localhost:3001/api` como padrão.

## Scripts do backend

| Comando | Função |
|---|---|
| `npm run dev` | Inicia o backend com nodemon |
| `npm run start` | Inicia o backend sem nodemon |
| `npm run db:migrate` | Roda as migrations |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:reset` | Reseta o banco e roda seed |
| `npm run setup` | Instala, migra, gera client e popula o banco |

## Endpoints

### Clientes

| Método | Rota | Função |
|---|---|---|
| GET | `/api/clientes` | Lista clientes |
| GET | `/api/clientes/:id` | Busca cliente |
| POST | `/api/clientes` | Cria cliente |
| PUT | `/api/clientes/:id` | Atualiza cliente |
| DELETE | `/api/clientes/:id` | Remove cliente |

### Planos

| Método | Rota | Função |
|---|---|---|
| GET | `/api/planos` | Lista planos |
| GET | `/api/planos/:id` | Busca plano |
| POST | `/api/planos` | Cria plano |
| PUT | `/api/planos/:id` | Atualiza plano |
| DELETE | `/api/planos/:id` | Remove plano |

### Assinaturas

| Método | Rota | Função |
|---|---|---|
| GET | `/api/assinaturas` | Lista assinaturas |
| GET | `/api/assinaturas/:id` | Busca assinatura |
| POST | `/api/assinaturas` | Cria assinatura |
| PUT | `/api/assinaturas/:id` | Atualiza assinatura |
| PUT | `/api/assinaturas/:id/cancelar` | Cancela assinatura |
| PUT | `/api/assinaturas/:id/reativar` | Reativa assinatura |
| DELETE | `/api/assinaturas/:id` | Remove assinatura |

### Relatórios

| Método | Rota | Função |
|---|---|---|
| GET | `/api/relatorios` | Retorna indicadores gerais |

## O que foi corrigido

- Removido Prisma 7 do backend.
- Removidos `@prisma/adapter-libsql` e `@libsql/client`.
- Backend agora usa Prisma 6 do jeito tradicional com SQLite local.

```

Se essa rota retornar JSON com `resumo`, o backend está funcionando.
