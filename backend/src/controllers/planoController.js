const prisma = require("../prisma/client");

function normalizarRecursos(recursos) {
  if (Array.isArray(recursos)) return recursos.map((r) => String(r).trim()).filter(Boolean);
  if (typeof recursos === "string") return recursos.split(";").map((r) => r.trim()).filter(Boolean);
  return [];
}

function serializarPlano(plano) {
  return {
    ...plano,
    recursos: (() => {
      try { return JSON.parse(plano.recursos); } catch { return []; }
    })(),
  };
}

async function listarPlanos(req, res) {
  try {
    const planos = await prisma.plano.findMany({ orderBy: { criadoEm: "desc" } });
    res.json(planos.map(serializarPlano));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao listar planos." });
  }
}

async function buscarPlano(req, res) {
  try {
    const id = Number(req.params.id);
    const plano = await prisma.plano.findUnique({ where: { id } });
    if (!plano) return res.status(404).json({ erro: "Plano não encontrado." });
    res.json(serializarPlano(plano));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao buscar plano." });
  }
}

async function criarPlano(req, res) {
  try {
    const { nome, descricao, precoMensal, limiteDispositivos, suporte, recursos } = req.body;

    const plano = await prisma.plano.create({
      data: {
        nome: nome.trim(),
        descricao: descricao.trim(),
        precoMensal: Number(precoMensal),
        limiteDispositivos: Number(limiteDispositivos),
        suporte: suporte.trim(),
        recursos: JSON.stringify(normalizarRecursos(recursos)),
      },
    });

    res.status(201).json(serializarPlano(plano));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao criar plano." });
  }
}

async function atualizarPlano(req, res) {
  try {
    const id = Number(req.params.id);
    const { nome, descricao, precoMensal, limiteDispositivos, suporte, recursos } = req.body;

    const plano = await prisma.plano.update({
      where: { id },
      data: {
        nome: nome.trim(),
        descricao: descricao.trim(),
        precoMensal: Number(precoMensal),
        limiteDispositivos: Number(limiteDispositivos),
        suporte: suporte.trim(),
        recursos: JSON.stringify(normalizarRecursos(recursos)),
      },
    });

    // Recalcular valor das assinaturas ativas vinculadas a este plano
    await prisma.$executeRaw`
      UPDATE assinaturas
      SET valor_mensal = ROUND(${Number(precoMensal)} * quantidade_firewalls, 2)
      WHERE plano_id = ${id} AND status = 'ativa'
    `;

    res.json(serializarPlano(plano));
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Plano não encontrado." });
    res.status(500).json({ erro: "Erro ao atualizar plano." });
  }
}

async function deletarPlano(req, res) {
  try {
    const id = Number(req.params.id);

    const possuiAssinatura = await prisma.assinatura.findFirst({ where: { planoId: id } });
    if (possuiAssinatura) {
      return res.status(400).json({ erro: "Não é possível remover um plano vinculado a assinaturas." });
    }

    await prisma.plano.delete({ where: { id } });
    res.json({ mensagem: "Plano removido com sucesso." });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Plano não encontrado." });
    res.status(500).json({ erro: "Erro ao deletar plano." });
  }
}

module.exports = { listarPlanos, buscarPlano, criarPlano, atualizarPlano, deletarPlano };
