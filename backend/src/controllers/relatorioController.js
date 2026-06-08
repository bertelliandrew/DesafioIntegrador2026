const prisma = require("../prisma/client");

function formatarMoeda(valor) {
  return Number(valor.toFixed(2));
}

function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = item[campo] || "Não informado";
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {});
}

async function gerarRelatorio(req, res) {
  try {
    const [clientes, planos, assinaturas] = await Promise.all([
      prisma.cliente.findMany(),
      prisma.plano.findMany(),
      prisma.assinatura.findMany({
        include: {
          cliente: { select: { estado: true } },
          plano:   { select: { id: true, nome: true } },
        },
      }),
    ]);

    const assinaturasAtivas     = assinaturas.filter((a) => a.status === "ativa");
    const assinaturasCanceladas = assinaturas.filter((a) => a.status === "cancelada");

    const receitaMensalAtiva = assinaturasAtivas.reduce((t, a) => t + a.valorMensal, 0);
    const taxaCancelamento   = assinaturas.length === 0 ? 0 : (assinaturasCanceladas.length / assinaturas.length) * 100;

    const assinaturasPorPlano = planos.map((plano) => {
      const relacionadas = assinaturas.filter((a) => a.planoId === plano.id);
      const ativas       = relacionadas.filter((a) => a.status === "ativa");
      const canceladas   = relacionadas.filter((a) => a.status === "cancelada");

      return {
        planoId:            plano.id,
        nomePlano:          plano.nome,
        total:              relacionadas.length,
        ativas:             ativas.length,
        canceladas:         canceladas.length,
        receitaMensalAtiva: formatarMoeda(ativas.reduce((t, a) => t + a.valorMensal, 0)),
      };
    });

    const planoMaisContratado = [...assinaturasPorPlano].sort((a, b) => b.total - a.total)[0] || null;

    const cancelamentosPorMotivo = contarPorCampo(assinaturasCanceladas, "motivoCancelamento");
    const clientesPorEstado      = contarPorCampo(clientes, "estado");

    res.json({
      resumo: {
        totalClientes:          clientes.length,
        totalPlanos:            planos.length,
        totalAssinaturas:       assinaturas.length,
        assinaturasAtivas:      assinaturasAtivas.length,
        assinaturasCanceladas:  assinaturasCanceladas.length,
        taxaCancelamento:       formatarMoeda(taxaCancelamento),
        receitaMensalAtiva:     formatarMoeda(receitaMensalAtiva),
      },
      assinaturasPorPlano,
      planoMaisContratado,
      cancelamentosPorMotivo,
      clientesPorEstado,
    });
  } catch (e) {
    console.error("ERRO AO GERAR RELATÓRIO:", e);
    res.status(500).json({
      erro: "Erro ao gerar relatório.",
      detalhes: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
}

module.exports = { gerarRelatorio };
