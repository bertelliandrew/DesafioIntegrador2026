# Desafio Integrador 2026 - FirewallSign

Sistema web para cadastro de clientes, planos de firewall, assinaturas, relatórios e análise estratégica de clientes.

## Tecnologias

- Frontend: Next.js, React e TypeScript
- Backend: NestJS, Prisma e SQLite
- IA: Python, Pandas, Scikit-learn e Random Forest

## Requisitos

- Node.js 22 LTS
- Python 3.12.1
- npm
- Git

## Como rodar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Crie ou atualize o banco:

```bash
npx prisma db push
```

Popule o banco com dados iniciais:

```bash
node prisma/seed.js
```

Inicie o backend:

```bash
npm run dev
```

O backend roda em:

```txt
http://localhost:3001
```

## Como rodar o frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend-next
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O frontend roda em:

```txt
http://localhost:3000
```

## Como rodar a parte de IA

Entre na pasta da IA:

```bash
cd ia
```

Crie o ambiente virtual:

```bash
py -3.12 -m venv .venv
```

Ative o ambiente virtual:

```bash
.venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Treine o modelo:

```bash
python treinar_modelo.py
```

Depois inicie o backend normalmente.

A tela de crescimento estratégico fica em:

```txt
http://localhost:3000/ia
```

A rota da API fica em:

```txt
http://localhost:3001/api/ia/clientes
```

## Rotas principais

### Clientes

```txt
GET    /api/clientes
POST   /api/clientes
PUT    /api/clientes/:id
DELETE /api/clientes/:id
```

### Planos

```txt
GET    /api/planos
POST   /api/planos
PUT    /api/planos/:id
DELETE /api/planos/:id
```

### Assinaturas

```txt
GET    /api/assinaturas
POST   /api/assinaturas
PUT    /api/assinaturas/:id
DELETE /api/assinaturas/:id
```

### Relatórios

```txt
GET /api/relatorios
```

### Crescimento estratégico

```txt
GET /api/ia/clientes
```
