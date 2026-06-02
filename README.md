# DesafioIntegrador2026 — Next.js Edition

Projeto migrado do frontend HTML/CSS/JS puro para **Next.js 14** com App Router e TypeScript.  
O backend Express original permanece **100% intacto**.

---

## Estrutura

```
DesafioIntegrador2026-nextjs/
├── backend/          ← Express API (sem alterações)
│   ├── src/
│   │   ├── server.js
│   │   ├── dados.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   └── package.json
│
└── frontend-next/    ← Next.js 14 (App Router + TypeScript)
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      ← Layout raiz com Navbar
    │   │   ├── page.tsx        ← Página inicial
    │   │   ├── globals.css     ← Estilos globais
    │   │   ├── clientes/
    │   │   │   └── page.tsx    ← CRUD de Clientes
    │   │   ├── produtos/
    │   │   │   └── page.tsx    ← CRUD de Produtos
    │   │   └── pedidos/
    │   │       └── page.tsx    ← CRUD de Pedidos
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── Navbar.module.css
    │   └── lib/
    │       └── api.ts          ← Helper de fetch + tipos TypeScript
    ├── .env.local.example
    ├── next.config.js
    ├── tsconfig.json
    └── package.json
```

---

## Como rodar

### 1. Backend (Express — porta 3001)

```bash
cd backend
npm install
npm start
```

### 2. Frontend (Next.js — porta 3000)

```bash
cd frontend-next

# Configure a URL da API (já tem valor padrão)
cp .env.local.example .env.local

npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## O que mudou (HTML → Next.js)

| Antes (HTML puro)                  | Depois (Next.js)                         |
|------------------------------------|------------------------------------------|
| `clientes.html` + JS inline        | `src/app/clientes/page.tsx` (React)      |
| `produtos.html` + JS inline        | `src/app/produtos/page.tsx` (React)      |
| `pedidos.html` + JS inline         | `src/app/pedidos/page.tsx` (React)       |
| `api.js` (funções globais)         | `src/lib/api.ts` (tipado com TypeScript) |
| `style.css` global                 | `globals.css` + CSS Modules (Navbar)     |
| Navegação por `<a href="...html">` | `next/link` com roteamento client-side   |
| `<nav>` repetido em cada página    | Componente `Navbar` compartilhado        |

---

## Backend — Endpoints disponíveis

| Método | URL                    | Descrição                  |
|--------|------------------------|----------------------------|
| GET    | /api/clientes          | Listar todos os clientes   |
| POST   | /api/clientes          | Criar cliente              |
| PUT    | /api/clientes/:id      | Atualizar cliente          |
| DELETE | /api/clientes/:id      | Remover cliente            |
| GET    | /api/produtos          | Listar todos os produtos   |
| POST   | /api/produtos          | Criar produto              |
| PUT    | /api/produtos/:id      | Atualizar produto          |
| DELETE | /api/produtos/:id      | Remover produto            |
| GET    | /api/pedidos           | Listar todos os pedidos    |
| POST   | /api/pedidos           | Criar pedido               |
| DELETE | /api/pedidos/:id       | Remover pedido             |

> **Nota:** os dados são em memória — reiniciar o backend limpa tudo.
