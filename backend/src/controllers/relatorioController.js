const db = require("../dados");

function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = item[campo] || "Não informado";
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {});
}

function formatarMoeda(valor) {
  return Number(valor.toFixed(2));
}

function gerarRelatorio(req, res) {
  const totalAssinaturas = db.assinaturas.length;
  const assinaturasAtivas = db.assinaturas.filter((a) => a.status === "ativa");
  const assinaturasCanceladas = db.assinaturas.filter((a) => a.status === "cancelada");
  const receitaMensalAtiva = assinaturasAtivas.reduce((total, assinatura) => total + assinatura.valorMensal, 0);
  const taxaCancelamento = totalAssinaturas === 0 ? 0 : (assinaturasCanceladas.length / totalAssinaturas) * 100;

  const assinaturasPorPlano = db.planos.map((plano) => {
    const relacionadas = db.assinaturas.filter((assinatura) => assinatura.planoId === plano.id);
    const ativas = relacionadas.filter((assinatura) => assinatura.status === "ativa").length;
    const canceladas = relacionadas.filter((assinatura) => assinatura.status === "cancelada").length;

    return {
      planoId: plano.id,
      nomePlano: plano.nome,
      total: relacionadas.length,
      ativas,
      canceladas,
      receitaMensalAtiva: formatarMoeda(
        relacionadas
          .filter((assinatura) => assinatura.status === "ativa")
          .reduce((total, assinatura) => total + assinatura.valorMensal, 0)
      ),
    };
  });

  const planoMaisContratado = [...assinaturasPorPlano].sort((a, b) => b.total - a.total)[0] || null;
  const cancelamentosPorMotivo = contarPorCampo(assinaturasCanceladas, "motivoCancelamento");
  const clientesPorEstado = contarPorCampo(db.clientes, "estado");

  res.json({
    resumo: {
      totalClientes: db.clientes.length,
      totalPlanos: db.planos.length,
      totalAssinaturas,
      assinaturasAtivas: assinaturasAtivas.length,
      assinaturasCanceladas: assinaturasCanceladas.length,
      taxaCancelamento: formatarMoeda(taxaCancelamento),
      receitaMensalAtiva: formatarMoeda(receitaMensalAtiva),
    },
    assinaturasPorPlano,
    planoMaisContratado,
    cancelamentosPorMotivo,
    clientesPorEstado,
  });
}

module.exports = { gerarRelatorio };
