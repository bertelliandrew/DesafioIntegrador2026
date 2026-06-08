# FirewallSign — Sistema de Assinaturas de Planos de Firewall

Sistema web para gerenciar clientes, planos de firewall, assinaturas e relatórios gerenciais.

Este projeto foi ajustado para ficar mais alinhado com a stack pedida no Desafio Integrador: **Next.js no frontend**, **NestJS no backend** e **Prisma + SQLite** para persistência.

## Stack

- Backend: NestJS + TypeScript + Prisma 6 + SQLite
- Frontend: Next.js 14 + React + TypeScript
- Banco de dados: SQLite
- ORM: Prisma

## Observação sobre o domínio do projeto

No enunciado original, o sistema fala em clientes, produtos e pedidos. Neste projeto, o domínio foi adaptado para uma empresa fictícia de planos de firewall:

- Clientes = empresas/clientes cadastrados
- Produtos = planos de firewall
- Pedidos = assinaturas/contratações dos planos

## Estrutura

```txt
DesafioIntegrador2026-main/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── assinaturas/
│   │   ├── clientes/
│   │   ├── dto/
│   │   ├── planos/
│   │   ├── prisma/
│   │   ├── relatorios/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
│
└── frontend-next/
    ├── src/app/
    ├── src/components/
    ├── src/lib/api.ts
    ├── .env.local.example
    └── package.json
```

## Requisitos

Use preferencialmente **Node 20 LTS** ou **Node 22 LTS**.

Evite Node 24 para este projeto, pois algumas dependências do ecossistema Prisma/Nest podem gerar avisos ou comportamentos inesperados.

## Variáveis de ambiente

### Backend — `backend/.env`

Crie o arquivo `backend/.env` com:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3001
```

### Frontend — `frontend-next/.env.local`

Crie o arquivo `frontend-next/.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Se não criar, o frontend usa `http://localhost:3001/api` como padrão.

## Como rodar o backend

Abra um terminal na pasta do projeto:

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

Teste a API no navegador:

```txt
http://localhost:3001/api/clientes
http://localhost:3001/api/planos
http://localhost:3001/api/assinaturas
http://localhost:3001/api/relatorios
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

## Scripts do backend

| Comando | Função |
|---|---|
| `npm run dev` | Inicia o backend NestJS em modo desenvolvimento |
| `npm run build` | Compila o backend TypeScript para `dist/` |
| `npm run start` | Inicia o backend compilado |
| `npm run db:migrate` | Roda as migrations do Prisma |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:reset` | Reseta o banco e roda seed |
| `npm run setup` | Instala, migra, gera client e popula o banco |

## Endpoints

Todas as rotas do backend usam o prefixo `/api`.

### Clientes

| Método | Rota | Função |
|---|---|---|
| GET | `/api/clientes` | Lista clientes |
| GET | `/api/clientes/:id` | Busca cliente |
| POST | `/api/clientes` | Cria cliente |
| PUT | `/api/clientes/:id` | Atualiza cliente |
| DELETE | `/api/clientes/:id` | Remove cliente |

### Planos de firewall

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

## Relatórios implementados

A rota `/api/relatorios` retorna:

- total de clientes;
- total de planos;
- total de assinaturas;
- assinaturas ativas;
- assinaturas canceladas;
- taxa de cancelamento;
- receita mensal ativa;
- assinaturas por plano;
- plano mais contratado;
- cancelamentos por motivo;
- clientes por estado.

## O que foi migrado para NestJS

O backend anterior em Express foi substituído por uma estrutura NestJS modular:

- `ClientesModule`, `ClientesController`, `ClientesService`
- `PlanosModule`, `PlanosController`, `PlanosService`
- `AssinaturasModule`, `AssinaturasController`, `AssinaturasService`
- `RelatoriosModule`, `RelatoriosController`, `RelatoriosService`
- `PrismaModule` e `PrismaService`
- DTOs com validação usando `class-validator`
- Prefixo global `/api`
- CORS habilitado

## Próximo passo do projeto

A próxima parte recomendada é implementar o módulo de Inteligência Artificial com Random Forest para:

- ranking de clientes com maior risco de churn;
- propensão à compra/upgrade;
- explicação simples do tratamento de dados usado no treinamento.
