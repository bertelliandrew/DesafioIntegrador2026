# FirewallSign — Assinaturas de Firewall

Sistema web do Desafio Integrador com tema de assinatura de planos de firewall. A aplicação mantém a separação entre frontend e backend, com Next.js + TypeScript no frontend e Node.js + Express no backend.

O projeto está sem banco de dados nesta etapa. Os dados ficam em memória no backend para facilitar a apresentação inicial e permitir que a persistência seja adicionada depois.

---

## Tema do sistema

A empresa fictícia vende assinaturas de firewall em três tipos de planos:

1. **Firewall Essencial** — plano inicial para pequenos ambientes.
2. **Firewall Profissional** — plano intermediário para empresas com mais dispositivos.
3. **Firewall Enterprise** — plano completo para ambientes críticos.

O sistema permite cadastrar clientes, manter planos, registrar assinaturas e acompanhar cancelamentos. A taxa de cancelamento é calculada como indicador operacional simples nesta versão.

---

## Estrutura

```text
DesafioIntegrador2026-main/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── dados.js
│   │   ├── controllers/
│   │   │   ├── assinaturaController.js
│   │   │   ├── clienteController.js
│   │   │   ├── planoController.js
│   │   │   └── relatorioController.js
│   │   ├── middlewares/
│   │   │   └── validacoes.js
│   │   └── routes/
│   │       ├── assinaturaRoutes.js
│   │       ├── clienteRoutes.js
│   │       ├── planoRoutes.js
│   │       └── relatorioRoutes.js
│   └── package.json
│
└── frontend-next/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx
    │   │   ├── clientes/page.tsx
    │   │   ├── planos/page.tsx
    │   │   ├── assinaturas/page.tsx
    │   │   ├── relatorios/page.tsx
    │   │   ├── globals.css
    │   │   └── layout.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── Navbar.module.css
    │   └── lib/
    │       └── api.ts
    └── package.json
```

---

## Como rodar

### 1. Backend — porta 3001

```bash
cd backend
npm install
npm start
```

A API ficará disponível em `http://localhost:3001`.

### 2. Frontend — porta 3000

```bash
cd frontend-next
cp .env.local.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variável de ambiente do frontend

Arquivo: `frontend-next/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Funcionalidades

### Clientes

- Listagem de clientes.
- Cadastro de cliente.
- Edição de cliente.
- Exclusão de cliente quando não houver assinatura vinculada.
- Validação de campos obrigatórios e formato de e-mail.

### Planos de firewall

- Três planos iniciais já cadastrados no backend.
- Cadastro de novos planos.
- Edição de preço, limite, suporte, descrição e recursos.
- Exclusão de plano quando não houver assinatura vinculada.

### Assinaturas

- Criação de assinatura vinculando cliente e plano.
- Cálculo automático do valor mensal com base no plano e na quantidade de firewalls.
- Edição de assinatura ativa.
- Cancelamento com motivo obrigatório.
- Reativação de assinatura cancelada.
- Exclusão de assinatura.

### Relatórios

- Total de clientes.
- Total de planos.
- Total de assinaturas.
- Assinaturas ativas.
- Assinaturas canceladas.
- Receita mensal ativa.
- Taxa de cancelamento.
- Assinaturas por plano.
- Motivos de cancelamento.
- Clientes por estado.

---

## Endpoints do backend

| Método | URL | Descrição |
|---|---|---|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/:id` | Buscar cliente |
| POST | `/api/clientes` | Criar cliente |
| PUT | `/api/clientes/:id` | Atualizar cliente |
| DELETE | `/api/clientes/:id` | Remover cliente |
| GET | `/api/planos` | Listar planos |
| GET | `/api/planos/:id` | Buscar plano |
| POST | `/api/planos` | Criar plano |
| PUT | `/api/planos/:id` | Atualizar plano |
| DELETE | `/api/planos/:id` | Remover plano |
| GET | `/api/assinaturas` | Listar assinaturas |
| GET | `/api/assinaturas/:id` | Buscar assinatura |
| POST | `/api/assinaturas` | Criar assinatura |
| PUT | `/api/assinaturas/:id` | Atualizar assinatura ativa |
| PUT | `/api/assinaturas/:id/cancelar` | Cancelar assinatura |
| PUT | `/api/assinaturas/:id/reativar` | Reativar assinatura |
| DELETE | `/api/assinaturas/:id` | Remover assinatura |
| GET | `/api/relatorios` | Gerar indicadores gerenciais |

---

## Observações para a próxima etapa

- Adicionar banco de dados relacional quando a modelagem estiver fechada.
- Criar migrations e entidades/tabelas para clientes, planos, assinaturas e cancelamentos.
- Integrar autenticação se o grupo decidir controlar acesso por perfil.
- Implementar a parte preditiva apenas quando houver base de dados suficiente e o modelo for definido pelo grupo.
