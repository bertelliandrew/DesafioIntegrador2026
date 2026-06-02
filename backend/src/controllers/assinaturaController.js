const db = require("../dados");

function listarAssinaturas(req, res) {
  res.json(db.assinaturas);
}

function buscarAssinatura(req, res) {
  const id = Number(req.params.id);
  const assinatura = db.assinaturas.find((a) => a.id === id);

  if (!assinatura) {
    return res.status(404).json({ erro: "Assinatura não encontrada." });
  }

  res.json(assinatura);
}

function criarAssinatura(req, res) {
  const { clienteId, planoId, quantidadeFirewalls, ciclo } = req.body;
  const cliente = db.clientes.find((c) => c.id === Number(clienteId));
  const plano = db.planos.find((p) => p.id === Number(planoId));
  const quantidade = Number(quantidadeFirewalls);

  if (!cliente) {
    return res.status(400).json({ erro: "Cliente não encontrado." });
  }

  if (!plano) {
    return res.status(400).json({ erro: "Plano de firewall não encontrado." });
  }

  if (quantidade > plano.limiteDispositivos) {
    return res.status(400).json({ erro: "A quantidade informada ultrapassa o limite do plano." });
  }

  const novaAssinatura = {
    id: db.gerarIdAssinatura(),
    clienteId: cliente.id,
    nomeCliente: cliente.nome,
    planoId: plano.id,
    nomePlano: plano.nome,
    quantidadeFirewalls: quantidade,
    ciclo: ciclo || "mensal",
    status: "ativa",
    valorMensal: Number((plano.precoMensal * quantidade).toFixed(2)),
    motivoCancelamento: null,
    criadoEm: new Date().toISOString(),
    canceladoEm: null,
  };

  db.assinaturas.push(novaAssinatura);
  res.status(201).json(novaAssinatura);
}

function atualizarAssinatura(req, res) {
  const id = Number(req.params.id);
  const index = db.assinaturas.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Assinatura não encontrada." });
  }

  if (db.assinaturas[index].status === "cancelada") {
    return res.status(400).json({ erro: "Assinaturas canceladas não podem ser alteradas." });
  }

  const { clienteId, planoId, quantidadeFirewalls, ciclo } = req.body;
  const cliente = db.clientes.find((c) => c.id === Number(clienteId));
  const plano = db.planos.find((p) => p.id === Number(planoId));
  const quantidade = Number(quantidadeFirewalls);

  if (!cliente) {
    return res.status(400).json({ erro: "Cliente não encontrado." });
  }

  if (!plano) {
    return res.status(400).json({ erro: "Plano de firewall não encontrado." });
  }

  if (quantidade > plano.limiteDispositivos) {
    return res.status(400).json({ erro: "A quantidade informada ultrapassa o limite do plano." });
  }

  db.assinaturas[index] = {
    ...db.assinaturas[index],
    clienteId: cliente.id,
    nomeCliente: cliente.nome,
    planoId: plano.id,
    nomePlano: plano.nome,
    quantidadeFirewalls: quantidade,
    ciclo: ciclo || "mensal",
    valorMensal: Number((plano.precoMensal * quantidade).toFixed(2)),
  };

  res.json(db.assinaturas[index]);
}

function cancelarAssinatura(req, res) {
  const id = Number(req.params.id);
  const index = db.assinaturas.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Assinatura não encontrada." });
  }

  if (db.assinaturas[index].status === "cancelada") {
    return res.status(400).json({ erro: "Essa assinatura já está cancelada." });
  }

  db.assinaturas[index] = {
    ...db.assinaturas[index],
    status: "cancelada",
    motivoCancelamento: req.body.motivoCancelamento.trim(),
    canceladoEm: new Date().toISOString(),
  };

  res.json(db.assinaturas[index]);
}

function reativarAssinatura(req, res) {
  const id = Number(req.params.id);
  const index = db.assinaturas.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Assinatura não encontrada." });
  }

  db.assinaturas[index] = {
    ...db.assinaturas[index],
    status: "ativa",
    motivoCancelamento: null,
    canceladoEm: null,
  };

  res.json(db.assinaturas[index]);
}

function deletarAssinatura(req, res) {
  const id = Number(req.params.id);
  const index = db.assinaturas.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Assinatura não encontrada." });
  }

  db.assinaturas.splice(index, 1);
  res.json({ mensagem: "Assinatura removida com sucesso." });
}

module.exports = {
  listarAssinaturas,
  buscarAssinatura,
  criarAssinatura,
  atualizarAssinatura,
  cancelarAssinatura,
  reativarAssinatura,
  deletarAssinatura,
};
