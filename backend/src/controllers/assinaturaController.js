const prisma = require("../prisma/client");

function serializarAssinatura(assinatura) {
  return {
    ...assinatura,
    nomeCliente: assinatura.cliente?.nome,
    nomePlano: assinatura.plano?.nome,
  };
}

const include = {
  cliente: { select: { nome: true } },
  plano:   { select: { nome: true } },
};

async function listarAssinaturas(req, res) {
  try {
    const assinaturas = await prisma.assinatura.findMany({
      include,
      orderBy: { criadoEm: "desc" },
    });
    res.json(assinaturas.map(serializarAssinatura));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao listar assinaturas." });
  }
}

async function buscarAssinatura(req, res) {
  try {
    const id = Number(req.params.id);
    const assinatura = await prisma.assinatura.findUnique({ where: { id }, include });
    if (!assinatura) return res.status(404).json({ erro: "Assinatura não encontrada." });
    res.json(serializarAssinatura(assinatura));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao buscar assinatura." });
  }
}

async function criarAssinatura(req, res) {
  try {
    const { clienteId, planoId, quantidadeFirewalls, ciclo } = req.body;
    const quantidade = Number(quantidadeFirewalls);

    const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
    if (!cliente) return res.status(400).json({ erro: "Cliente não encontrado." });

    const plano = await prisma.plano.findUnique({ where: { id: Number(planoId) } });
    if (!plano) return res.status(400).json({ erro: "Plano de firewall não encontrado." });

    if (quantidade > plano.limiteDispositivos) {
      return res.status(400).json({ erro: "A quantidade informada ultrapassa o limite do plano." });
    }

    const assinatura = await prisma.assinatura.create({
      data: {
        clienteId: cliente.id,
        planoId: plano.id,
        quantidadeFirewalls: quantidade,
        ciclo: ciclo || "mensal",
        status: "ativa",
        valorMensal: Number((plano.precoMensal * quantidade).toFixed(2)),
      },
      include,
    });

    res.status(201).json(serializarAssinatura(assinatura));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao criar assinatura." });
  }
}

async function atualizarAssinatura(req, res) {
  try {
    const id = Number(req.params.id);

    const existente = await prisma.assinatura.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: "Assinatura não encontrada." });
    if (existente.status === "cancelada") {
      return res.status(400).json({ erro: "Assinaturas canceladas não podem ser alteradas." });
    }

    const { clienteId, planoId, quantidadeFirewalls, ciclo } = req.body;
    const quantidade = Number(quantidadeFirewalls);

    const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
    if (!cliente) return res.status(400).json({ erro: "Cliente não encontrado." });

    const plano = await prisma.plano.findUnique({ where: { id: Number(planoId) } });
    if (!plano) return res.status(400).json({ erro: "Plano de firewall não encontrado." });

    if (quantidade > plano.limiteDispositivos) {
      return res.status(400).json({ erro: "A quantidade informada ultrapassa o limite do plano." });
    }

    const assinatura = await prisma.assinatura.update({
      where: { id },
      data: {
        clienteId: cliente.id,
        planoId: plano.id,
        quantidadeFirewalls: quantidade,
        ciclo: ciclo || "mensal",
        valorMensal: Number((plano.precoMensal * quantidade).toFixed(2)),
      },
      include,
    });

    res.json(serializarAssinatura(assinatura));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao atualizar assinatura." });
  }
}

async function cancelarAssinatura(req, res) {
  try {
    const id = Number(req.params.id);

    const existente = await prisma.assinatura.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: "Assinatura não encontrada." });
    if (existente.status === "cancelada") {
      return res.status(400).json({ erro: "Essa assinatura já está cancelada." });
    }

    const assinatura = await prisma.assinatura.update({
      where: { id },
      data: {
        status: "cancelada",
        motivoCancelamento: req.body.motivoCancelamento.trim(),
        canceladoEm: new Date(),
      },
      include,
    });

    res.json(serializarAssinatura(assinatura));
  } catch (e) {
    res.status(500).json({ erro: "Erro ao cancelar assinatura." });
  }
}

async function reativarAssinatura(req, res) {
  try {
    const id = Number(req.params.id);

    const assinatura = await prisma.assinatura.update({
      where: { id },
      data: {
        status: "ativa",
        motivoCancelamento: null,
        canceladoEm: null,
      },
      include,
    });

    res.json(serializarAssinatura(assinatura));
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Assinatura não encontrada." });
    res.status(500).json({ erro: "Erro ao reativar assinatura." });
  }
}

async function deletarAssinatura(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.assinatura.delete({ where: { id } });
    res.json({ mensagem: "Assinatura removida com sucesso." });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Assinatura não encontrada." });
    res.status(500).json({ erro: "Erro ao deletar assinatura." });
  }
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
