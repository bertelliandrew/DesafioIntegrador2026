require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.assinatura.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.cliente.deleteMany();

  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: "Empresa Alpha",
        email: "contato@alpha.com",
        cidade: "Guarapuava",
        estado: "PR",
        pais: "Brasil",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Clínica Beta",
        email: "contato@beta.com",
        cidade: "Curitiba",
        estado: "PR",
        pais: "Brasil",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Loja Gamma",
        email: "contato@gamma.com",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil",
      },
    }),
  ]);

  const planos = await Promise.all([
    prisma.plano.create({
      data: {
        nome: "Essencial",
        descricao: "Proteção básica para pequenas empresas.",
        precoMensal: 89.9,
        limiteDispositivos: 5,
        suporte: "E-mail",
        recursos: JSON.stringify(["Firewall básico", "Relatórios mensais", "Bloqueio de ameaças comuns"]),
      },
    }),
    prisma.plano.create({
      data: {
        nome: "Profissional",
        descricao: "Plano intermediário com suporte prioritário.",
        precoMensal: 149.9,
        limiteDispositivos: 15,
        suporte: "E-mail e chat",
        recursos: JSON.stringify(["Firewall avançado", "Monitoramento", "Relatórios semanais", "Suporte prioritário"]),
      },
    }),
    prisma.plano.create({
      data: {
        nome: "Enterprise",
        descricao: "Proteção completa para grandes operações.",
        precoMensal: 299.9,
        limiteDispositivos: 50,
        suporte: "24/7",
        recursos: JSON.stringify(["Firewall avançado", "Monitoramento 24/7", "Relatórios diários", "Consultoria de segurança"]),
      },
    }),
  ]);

  await prisma.assinatura.createMany({
    data: [
      {
        clienteId: clientes[0].id,
        planoId: planos[1].id,
        quantidadeFirewalls: 3,
        ciclo: "mensal",
        status: "ativa",
        valorMensal: Number((planos[1].precoMensal * 3).toFixed(2)),
      },
      {
        clienteId: clientes[1].id,
        planoId: planos[0].id,
        quantidadeFirewalls: 2,
        ciclo: "mensal",
        status: "ativa",
        valorMensal: Number((planos[0].precoMensal * 2).toFixed(2)),
      },
      {
        clienteId: clientes[2].id,
        planoId: planos[2].id,
        quantidadeFirewalls: 5,
        ciclo: "anual",
        status: "cancelada",
        valorMensal: Number((planos[2].precoMensal * 5).toFixed(2)),
        motivoCancelamento: "Troca de fornecedor",
        canceladoEm: new Date(),
      },
    ],
  });

  console.log("Banco populado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
