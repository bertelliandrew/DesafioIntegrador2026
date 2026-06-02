const clientes = [
  {
    id: 1,
    nome: "Empresa Alpha",
    email: "contato@alpha.com.br",
    cidade: "Guarapuava",
    estado: "PR",
    pais: "Brasil",
    criadoEm: "2026-05-08T09:00:00.000Z",
  },
  {
    id: 2,
    nome: "Mercado Central",
    email: "ti@mercadocentral.com.br",
    cidade: "Curitiba",
    estado: "PR",
    pais: "Brasil",
    criadoEm: "2026-05-09T10:30:00.000Z",
  },
];

const planos = [
  {
    id: 1,
    nome: "Firewall Essencial",
    descricao: "Plano inicial para pequenos ambientes com proteção de borda e regras básicas.",
    precoMensal: 149.9,
    limiteDispositivos: 10,
    suporte: "Comercial",
    recursos: ["Regras de entrada e saída", "Bloqueio por portas", "Relatório mensal"],
    criadoEm: "2026-05-08T09:00:00.000Z",
  },
  {
    id: 2,
    nome: "Firewall Profissional",
    descricao: "Plano intermediário para empresas com múltiplas filiais e monitoramento ampliado.",
    precoMensal: 349.9,
    limiteDispositivos: 50,
    suporte: "Prioritário",
    recursos: ["VPN site-to-site", "Regras avançadas", "Alertas operacionais"],
    criadoEm: "2026-05-08T09:00:00.000Z",
  },
  {
    id: 3,
    nome: "Firewall Enterprise",
    descricao: "Plano completo para ambientes críticos com alta disponibilidade e suporte dedicado.",
    precoMensal: 799.9,
    limiteDispositivos: 200,
    suporte: "Dedicado",
    recursos: ["Alta disponibilidade", "Segmentação de rede", "Relatórios executivos"],
    criadoEm: "2026-05-08T09:00:00.000Z",
  },
];

const assinaturas = [
  {
    id: 1,
    clienteId: 1,
    nomeCliente: "Empresa Alpha",
    planoId: 2,
    nomePlano: "Firewall Profissional",
    quantidadeFirewalls: 2,
    ciclo: "mensal",
    status: "ativa",
    valorMensal: 699.8,
    motivoCancelamento: null,
    criadoEm: "2026-05-10T14:15:00.000Z",
    canceladoEm: null,
  },
  {
    id: 2,
    clienteId: 2,
    nomeCliente: "Mercado Central",
    planoId: 1,
    nomePlano: "Firewall Essencial",
    quantidadeFirewalls: 1,
    ciclo: "mensal",
    status: "cancelada",
    valorMensal: 149.9,
    motivoCancelamento: "Migração para outro fornecedor",
    criadoEm: "2026-05-11T11:20:00.000Z",
    canceladoEm: "2026-05-20T16:45:00.000Z",
  },
];

let proximoIdCliente = clientes.length + 1;
let proximoIdPlano = planos.length + 1;
let proximoIdAssinatura = assinaturas.length + 1;

function gerarIdCliente() {
  return proximoIdCliente++;
}

function gerarIdPlano() {
  return proximoIdPlano++;
}

function gerarIdAssinatura() {
  return proximoIdAssinatura++;
}

module.exports = {
  clientes,
  planos,
  assinaturas,
  gerarIdCliente,
  gerarIdPlano,
  gerarIdAssinatura,
};
