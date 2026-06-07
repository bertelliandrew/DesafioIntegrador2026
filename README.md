# FirewallSign — Sistema de Assinaturas de Planos de Firewall

Sistema completo para gerenciamento de clientes, planos e assinaturas de firewall.  
**Stack:** Node.js + Express + Prisma + SQLite · Next.js 14 (App Router) + TypeScript

---

## Estrutura do Projeto

```
DesafioIntegrador2026/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← Modelos do banco de dados
│   │   └── seed.js             ← Dados iniciais para popular o banco
│   ├── src/
│   │   ├── controllers/        ← Lógica de negócio (Prisma)
│   │   ├── middlewares/        ← Validações de entrada
│   │   ├── prisma/
│   │   │   └── client.js       ← Instância singleton do PrismaClient
│   │   ├── routes/             ← Definição de rotas Express
│   │   └── server.js           ← Entry point da API
│   ├── .env.example
│   └── package.json
│
└── frontend-next/
    ├── src/
    │   ├── app/                ← Páginas (App Router)
    │   │   ├── clientes/
    │   │   ├── planos/
    │   │   ├── assinaturas/
    │   │   └── relatorios/
    │   ├── components/
    │   │   └── Navbar.tsx
    │   └── lib/
    │       └── api.ts          ← Helper de fetch + tipos TypeScript
    └── package.json
```

---

## Banco de Dados — Prisma + SQLite

O banco de dados é gerenciado pelo **Prisma ORM** com **SQLite** como provider.  
O arquivo `dev.db` é gerado automaticamente e fica dentro de `backend/prisma/`.

### Modelos

| Tabela        | Campos principais                                                             |
|---------------|------------------------------------------------------------------------------|
| `clientes`    | id, nome, email (único), cidade, estado, pais, criadoEm                     |
| `planos`      | id, nome, descricao, precoMensal, limiteDispositivos, suporte, recursos (JSON) |
| `assinaturas` | id, clienteId (FK), planoId (FK), quantidade, ciclo, status, valorMensal   |

### Relações

```
Cliente  ──< Assinatura >── Plano
```

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- npm
- Prisma Versão 5/6

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variável de ambiente
cp .env.example .env

# Criar o banco e rodar as migrations
npx prisma migrate dev --name init

# Popular com dados iniciais
node prisma/seed.js

# Iniciar servidor (porta 3001)
npm run dev
```

**Ou use o comando setup (faz tudo de uma vez):**

```bash
npm run setup
```

### 2. Frontend (Next.js — porta 3000)

```bash
cd frontend-next
cp .env.local.example .env.local
npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## Scripts do Backend

| Comando              | Descrição                                            |
|----------------------|------------------------------------------------------|
| `npm run dev`        | Inicia o servidor com nodemon (hot reload)           |
| `npm run start`      | Inicia o servidor sem hot reload                     |
| `npm run db:migrate` | Cria/aplica migrations do Prisma                     |
| `npm run db:seed`    | Popula o banco com dados iniciais                    |
| `npm run db:studio`  | Abre o Prisma Studio (GUI visual do banco)           |
| `npm run db:reset`   | Reseta o banco e repopula do zero                    |
| `npm run setup`      | install + migrate + seed (primeira vez)              |

### Prisma Studio

Para inspecionar o banco visualmente no browser:

```bash
cd backend
npx prisma studio
```

---

## Endpoints da API

### Clientes

| Método | Rota                | Descrição                     |
|--------|---------------------|-------------------------------|
| GET    | /api/clientes       | Listar todos os clientes      |
| GET    | /api/clientes/:id   | Buscar cliente por ID         |
| POST   | /api/clientes       | Criar novo cliente            |
| PUT    | /api/clientes/:id   | Atualizar cliente             |
| DELETE | /api/clientes/:id   | Remover cliente               |

### Planos

| Método | Rota              | Descrição                   |
|--------|-------------------|-----------------------------|
| GET    | /api/planos       | Listar todos os planos      |
| GET    | /api/planos/:id   | Buscar plano por ID         |
| POST   | /api/planos       | Criar novo plano            |
| PUT    | /api/planos/:id   | Atualizar plano             |
| DELETE | /api/planos/:id   | Remover plano               |

### Assinaturas

| Método | Rota                          | Descrição                    |
|--------|-------------------------------|------------------------------|
| GET    | /api/assinaturas              | Listar todas as assinaturas  |
| GET    | /api/assinaturas/:id          | Buscar assinatura por ID     |
| POST   | /api/assinaturas              | Criar nova assinatura        |
| PUT    | /api/assinaturas/:id          | Atualizar assinatura         |
| PUT    | /api/assinaturas/:id/cancelar | Cancelar assinatura          |
| PUT    | /api/assinaturas/:id/reativar | Reativar assinatura          |
| DELETE | /api/assinaturas/:id          | Remover assinatura           |

### Relatórios

| Método | Rota           | Descrição                              |
|--------|----------------|----------------------------------------|
| GET    | /api/relatorios | Relatório geral: receita, planos, etc |

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3001
```

### Frontend (`frontend-next/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Observações

- O SQLite gera um arquivo `dev.db` local — sem necessidade de instalar nenhum servidor de banco.
- O `dev.db` está no `.gitignore`; cada desenvolvedor roda `npm run setup` para criar o banco localmente.
- As migrations ficam versionadas em `prisma/migrations/` e devem ser commitadas.
- O campo `recursos` dos planos é armazenado como JSON serializado (string) no SQLite e deserializado automaticamente nas respostas da API.
