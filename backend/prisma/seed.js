const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados...");

  // Limpar dados existentes
  await prisma.assinatura.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.plano.deleteMany();

  // Clientes
  const alpha = await prisma.cliente.create({
    data: {
      nome: "Empresa Alpha",
      email: "contato@alpha.com.br",
      cidade: "Guarapuava",
      estado: "PR",
      pais: "Brasil",
      criadoEm: new Date("2026-05-08T09:00:00.000Z"),
    },
  });

  const mercado = await prisma.cliente.create({
    data: {
      nome: "Mercado Central",
      email: "ti@mercadocentral.com.br",
      cidade: "Curitiba",
      estado: "PR",
      pais: "Brasil",
      criadoEm: new Date("2026-05-09T10:30:00.000Z"),
    },
  });

  // Planos
  const essencial = await prisma.plano.create({
    data: {
      nome: "Firewall Essencial",
      descricao: "Plano inicial para pequenos ambientes com proteção de borda e regras básicas.",
      precoMensal: 149.9,
      limiteDispositivos: 10,
      suporte: "Comercial",
      recursos: JSON.stringify(["Regras de entrada e saída", "Bloqueio por portas", "Relatório mensal"]),
      criadoEm: new Date("2026-05-08T09:00:00.000Z"),
    },
  });

  const profissional = await prisma.plano.create({
    data: {
      nome: "Firewall Profissional",
      descricao: "Plano intermediário para empresas com múltiplas filiais e monitoramento ampliado.",
      precoMensal: 349.9,
      limiteDispositivos: 50,
      suporte: "Prioritário",
      recursos: JSON.stringify(["VPN site-to-site", "Regras avançadas", "Alertas operacionais"]),
      criadoEm: new Date("2026-05-08T09:00:00.000Z"),
    },
  });

  await prisma.plano.create({
    data: {
      nome: "Firewall Enterprise",
      descricao: "Plano completo para ambientes críticos com alta disponibilidade e suporte dedicado.",
      precoMensal: 799.9,
      limiteDispositivos: 200,
      suporte: "Dedicado",
      recursos: JSON.stringify(["Alta disponibilidade", "Segmentação de rede", "Relatórios executivos"]),
      criadoEm: new Date("2026-05-08T09:00:00.000Z"),
    },
  });

  // Assinaturas
  await prisma.assinatura.create({
    data: {
      clienteId: alpha.id,
      planoId: profissional.id,
      quantidadeFirewalls: 2,
      ciclo: "mensal",
      status: "ativa",
      valorMensal: 699.8,
      criadoEm: new Date("2026-05-10T14:15:00.000Z"),
    },
  });

  await prisma.assinatura.create({
    data: {
      clienteId: mercado.id,
      planoId: essencial.id,
      quantidadeFirewalls: 1,
      ciclo: "mensal",
      status: "cancelada",
      valorMensal: 149.9,
      motivoCancelamento: "Migração para outro fornecedor",
      criadoEm: new Date("2026-05-11T11:20:00.000Z"),
      canceladoEm: new Date("2026-05-20T16:45:00.000Z"),
    },
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log(`   ${await prisma.cliente.count()} clientes`);
  console.log(`   ${await prisma.plano.count()} planos`);
  console.log(`   ${await prisma.assinatura.count()} assinaturas`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
