# FirewallSign — Desafio Integrador 2026

Sistema web para gestão de clientes, planos de firewall, assinaturas, relatórios gerenciais e apoio à decisão estratégica para crescimento.

O projeto foi adaptado ao tema do desafio da seguinte forma:

- **Clientes** continuam sendo os clientes cadastrados.
- **Produtos** são representados pelos **planos de firewall**.
- **Pedidos** são representados pelas **assinaturas/contratações**.
- **Relatórios** mostram indicadores gerenciais.
- **Crescimento estratégico** usa Random Forest para apoiar decisões, classificando risco de churn e propensão de compra.

---

## Stack do projeto

### Frontend

- Next.js 14
- React
- TypeScript

### Backend

- NestJS 10
- TypeScript
- Prisma 6.19.2
- SQLite

### Crescimento Estratégico com Random Forest

- Python 3.12.1
- pandas
- scikit-learn
- joblib
- Random Forest

---

## Versões recomendadas

Use estas versões para evitar erro de instalação:

```txt
Node.js: 22 LTS
npm: versão que vem com o Node 22
Python: 3.12.1
Prisma: 6.19.2
```

Evite usar **Node 24** neste projeto, porque pode gerar avisos de compatibilidade com algumas dependências.

Evite usar **Python 3.14** ou Python beta, porque pandas/scikit-learn podem tentar compilar pacotes e dar erro no Windows.

Para conferir:

```bash
node -v
npm -v
python --version
py -0
```

---

## Corrigir registry do npm, caso necessário

Se o `npm install` der erro de timeout ou tentar baixar pacote de um registry estranho, rode:

```bash
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm cache clean --force
```

Depois confira:

```bash
npm config get registry
```

O esperado é:

```txt
https://registry.npmjs.org/
```

---

## Estrutura do projeto

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
│   │   ├── ia/
│   │   ├── planos/
│   │   ├── prisma/
│   │   ├── relatorios/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-next/
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/api.ts
│   ├── .env.local.example
│   └── package.json
│
├── ia/
│   ├── dados_treinamento.csv
│   ├── requirements.txt
│   ├── treinar_modelo.py
│   ├── prever_clientes.py
│   ├── modelo_random_forest.pkl
│   └── README_IA.md
│
├── .gitignore
└── README.md
```

---

## Configuração das variáveis de ambiente

### Backend

backend/.env
com o conteúdo:


DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3001

Também existe o arquivo `backend/.env.example` como exemplo.

### Frontend


frontend-next/.env.local


com o conteúdo:

NEXT_PUBLIC_API_URL=http://localhost:3001/api

Também existe o arquivo `frontend-next/.env.local.example` como exemplo.

---

# Passo a passo para rodar tudo

## 1. Backend NestJS

Abra um terminal na raiz do projeto e entre no backend:

cd backend
npm install
npx prisma generate`

Crie ou atualize o banco SQLite:

npx prisma migrate dev --name init


Se a migration não for necessária ou se preferir apenas sincronizar o banco com o schema, use:
npx prisma db push


Inicie o backend:
npm run dev

O backend deve rodar em:


http://localhost:3001


## 2. Crescimento estratégico com Python e Random Forest

Abra outro terminal na raiz do projeto e entre na pasta do módulo preditivo:


cd ia
py -3.12 -m venv .venv
.venv\Scripts\activate


Confira a versão:

```bash
python -V
```

O esperado é algo como:

```txt
Python 3.12.1
```

Atualize o pip:
python -m pip install --upgrade pip
pip install -r requirements.txt

Treine o modelo:
python treinar_modelo.py


```


## 3. Frontend Next.js

Abra outro terminal na raiz do projeto e entre no frontend:


cd frontend-next
npm install
npm run dev


O frontend deve rodar em:
http://localhost:3000


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
| `npm run ia:train` | Treina o modelo Random Forest em Python |

---

## Rotas principais da API

Todas as rotas usam o prefixo `/api`.

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
| GET | `/api/relatorios` | Retorna indicadores gerenciais |

### Crescimento Estratégico com Random Forest

| Método | Rota | Função |
|---|---|---|
| GET | `/api/ia/clientes` | Retorna ranking de clientes por risco de churn e propensão de compra |

---

## Explicação simples do módulo preditivo

O módulo de crescimento estratégico usa um modelo **Random Forest** para gerar uma análise dos clientes.

O módulo retorna:

- risco de churn;
- propensão de compra;
- classificação do cliente;
- recomendação estratégica.

Como a base do sistema é pequena, foi usado um conjunto de dados simples de treinamento em `ia/dados_treinamento.csv`. Esse conjunto serve para demonstrar o funcionamento do modelo e permitir a integração com o sistema web.

O backend NestJS chama o script Python e retorna os dados para o frontend. Caso o Python não esteja configurado, existe uma regra simples de fallback para a rota não quebrar durante a demonstração.

---

## Tratamento de dados usado no módulo preditivo

Antes do treinamento, os dados passam por tratamento simples:

- leitura dos dados do CSV;
- remoção de registros inválidos;
- conversão de campos categóricos para valores numéricos;
- separação das variáveis de entrada e saída;
- treinamento com Random Forest.

As principais informações usadas para a análise são:

- quantidade de firewalls;
- valor mensal;
- ciclo da assinatura;
- plano contratado;
- status da assinatura;
- histórico de cancelamento.

