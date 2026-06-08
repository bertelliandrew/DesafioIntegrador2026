# FirewallSign — Sistema de Assinaturas de Planos de Firewall

Sistema completo para gerenciamento de clientes, planos e assinaturas de firewall.  
**Stack:** Node.js + Express + Prisma 7 + SQLite · Next.js 14 (App Router) + TypeScript

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
│   ├── prisma.config.js        ← Configuração do Prisma 7 (URL do banco)
│   ├── .env.example            ← Modelo do arquivo de variáveis de ambiente
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

## Banco de Dados — Prisma 7 + SQLite

O banco de dados é gerenciado pelo **Prisma ORM 7** com **SQLite** como provider.  
O arquivo `dev.db` é gerado automaticamente e fica dentro de `backend/prisma/`.

> ⚠️ **Prisma 7:** A URL do banco não fica mais no `schema.prisma`.  
> Ela é configurada no arquivo `backend/prisma.config.js`.

### Modelos

| Tabela        | Campos principais                                                              |
|---------------|--------------------------------------------------------------------------------|
| `clientes`    | id, nome, email (único), cidade, estado, pais, criadoEm                        |
| `planos`      | id, nome, descricao, precoMensal, limiteDispositivos, suporte, recursos (JSON) |
| `assinaturas` | id, clienteId (FK), planoId (FK), quantidade, ciclo, status, valorMensal       |

### Relações

```
Cliente  ──< Assinatura >── Plano
```

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- npm
- Prisma 7

### 1. Backend

> ⚠️ **Atenção:** todos os comandos abaixo devem ser executados **dentro da pasta `backend`**.

```bash
# Entre na pasta do backend — NÃO pule esse passo
cd backend

# Instalar dependências
npm install

# Criar o arquivo de variáveis de ambiente
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env

# Criar o banco e rodar as migrations
npx prisma migrate dev --name init

# Popular com dados iniciais
node prisma/seed.js

# Iniciar servidor (porta 3001)
npm run dev
```

**Ou use o comando setup (faz tudo de uma vez, exceto criar o .env):**

```bash
# Entre na pasta do backend primeiro!
cd backend

# Crie o .env antes de rodar o setup
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

# Agora sim:
npm run setup
```

### 2. Frontend (Next.js — porta 3000)

> Abra um **novo terminal** para o frontend. Não feche o terminal do backend.

```bash
# Entre na pasta do frontend — NÃO na raiz do projeto
cd frontend-next

# Windows:
copy .env.local.example .env.local
# Mac/Linux:
cp .env.local.example .env.local

npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## Scripts do Backend

> Todos os scripts abaixo devem ser executados **dentro da pasta `backend`**.

| Comando              | Descrição                                  |
|----------------------|--------------------------------------------|
| `npm run dev`        | Inicia o servidor com nodemon (hot reload) |
| `npm run start`      | Inicia o servidor sem hot reload           |
| `npm run db:migrate` | Cria/aplica migrations do Prisma           |
| `npm run db:seed`    | Popula o banco com dados iniciais          |
| `npm run db:studio`  | Abre o Prisma Studio (GUI visual do banco) |
| `npm run db:reset`   | Reseta o banco e repopula do zero          |
| `npm run setup`      | install + migrate + seed (primeira vez)    |

### Prisma Studio

```bash
cd backend
npx prisma studio
```

---

## Endpoints da API

### Clientes

| Método | Rota              | Descrição                |
|--------|-------------------|--------------------------|
| GET    | /api/clientes     | Listar todos os clientes |
| GET    | /api/clientes/:id | Buscar cliente por ID    |
| POST   | /api/clientes     | Criar novo cliente       |
| PUT    | /api/clientes/:id | Atualizar cliente        |
| DELETE | /api/clientes/:id | Remover cliente          |

### Planos

| Método | Rota            | Descrição              |
|--------|-----------------|------------------------|
| GET    | /api/planos     | Listar todos os planos |
| GET    | /api/planos/:id | Buscar plano por ID    |
| POST   | /api/planos     | Criar novo plano       |
| PUT    | /api/planos/:id | Atualizar plano        |
| DELETE | /api/planos/:id | Remover plano          |

### Assinaturas

| Método | Rota                          | Descrição                   |
|--------|-------------------------------|-----------------------------|
| GET    | /api/assinaturas              | Listar todas as assinaturas |
| GET    | /api/assinaturas/:id          | Buscar assinatura por ID    |
| POST   | /api/assinaturas              | Criar nova assinatura       |
| PUT    | /api/assinaturas/:id          | Atualizar assinatura        |
| PUT    | /api/assinaturas/:id/cancelar | Cancelar assinatura         |
| PUT    | /api/assinaturas/:id/reativar | Reativar assinatura         |
| DELETE | /api/assinaturas/:id          | Remover assinatura          |

### Relatórios

| Método | Rota            | Descrição                             |
|--------|-----------------|---------------------------------------|
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
- O `dev.db` está no `.gitignore`; cada desenvolvedor precisa criar o `.env` e rodar o setup localmente.
- As migrations ficam versionadas em `prisma/migrations/` e devem ser commitadas.
- O campo `recursos` dos planos é armazenado como JSON serializado (string) no SQLite e deserializado automaticamente nas respostas da API.
- **Prisma 7:** a URL do banco é configurada em `backend/prisma.config.js` e lida via `dotenv`. O `.env` **precisa existir** antes de rodar qualquer comando Prisma.
