const db = require("../dados");

function normalizarRecursos(recursos) {
  if (Array.isArray(recursos)) {
    return recursos.map((recurso) => String(recurso).trim()).filter(Boolean);
  }

  if (typeof recursos === "string") {
    return recursos
      .split(";")
      .map((recurso) => recurso.trim())
      .filter(Boolean);
  }

  return [];
}

function listarPlanos(req, res) {
  res.json(db.planos);
}

function buscarPlano(req, res) {
  const id = Number(req.params.id);
  const plano = db.planos.find((p) => p.id === id);

  if (!plano) {
    return res.status(404).json({ erro: "Plano não encontrado." });
  }

  res.json(plano);
}

function criarPlano(req, res) {
  const { nome, descricao, precoMensal, limiteDispositivos, suporte, recursos } = req.body;

  const novoPlano = {
    id: db.gerarIdPlano(),
    nome: nome.trim(),
    descricao: descricao.trim(),
    precoMensal: Number(precoMensal),
    limiteDispositivos: Number(limiteDispositivos),
    suporte: suporte.trim(),
    recursos: normalizarRecursos(recursos),
    criadoEm: new Date().toISOString(),
  };

  db.planos.push(novoPlano);
  res.status(201).json(novoPlano);
}

function atualizarPlano(req, res) {
  const id = Number(req.params.id);
  const index = db.planos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Plano não encontrado." });
  }

  const { nome, descricao, precoMensal, limiteDispositivos, suporte, recursos } = req.body;

  db.planos[index] = {
    ...db.planos[index],
    nome: nome.trim(),
    descricao: descricao.trim(),
    precoMensal: Number(precoMensal),
    limiteDispositivos: Number(limiteDispositivos),
    suporte: suporte.trim(),
    recursos: normalizarRecursos(recursos),
  };

  db.assinaturas.forEach((assinatura) => {
    if (assinatura.planoId === id) {
      assinatura.nomePlano = db.planos[index].nome;
      assinatura.valorMensal = Number((db.planos[index].precoMensal * assinatura.quantidadeFirewalls).toFixed(2));
    }
  });

  res.json(db.planos[index]);
}

function deletarPlano(req, res) {
  const id = Number(req.params.id);
  const possuiAssinatura = db.assinaturas.some((assinatura) => assinatura.planoId === id);

  if (possuiAssinatura) {
    return res.status(400).json({ erro: "Não é possível remover um plano vinculado a assinaturas." });
  }

  const index = db.planos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Plano não encontrado." });
  }

  db.planos.splice(index, 1);
  res.json({ mensagem: "Plano removido com sucesso." });
}

module.exports = {
  listarPlanos,
  buscarPlano,
  criarPlano,
  atualizarPlano,
  deletarPlano,
};
