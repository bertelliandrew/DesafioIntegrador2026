const prisma = require("../prisma/client");

async function listarClientes(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { criadoEm: "desc" },
    });
    res.json(clientes);
  } catch (e) {
    res.status(500).json({ erro: "Erro ao listar clientes." });
  }
}

async function buscarCliente(req, res) {
  try {
    const id = Number(req.params.id);
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });
    res.json(cliente);
  } catch (e) {
    res.status(500).json({ erro: "Erro ao buscar cliente." });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, email, cidade, estado, pais } = req.body;
    const emailNormalizado = email.trim().toLowerCase();

    const cliente = await prisma.cliente.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        pais: pais.trim(),
      },
    });

    res.status(201).json(cliente);
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(400).json({ erro: "Já existe um cliente com esse e-mail." });
    }
    res.status(500).json({ erro: "Erro ao criar cliente." });
  }
}

async function atualizarCliente(req, res) {
  try {
    const id = Number(req.params.id);
    const { nome, email, cidade, estado, pais } = req.body;
    const emailNormalizado = email.trim().toLowerCase();

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        pais: pais.trim(),
      },
    });

    res.json(cliente);
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Cliente não encontrado." });
    if (e.code === "P2002") return res.status(400).json({ erro: "Esse e-mail já está sendo usado por outro cliente." });
    res.status(500).json({ erro: "Erro ao atualizar cliente." });
  }
}

async function deletarCliente(req, res) {
  try {
    const id = Number(req.params.id);

    const possuiAssinatura = await prisma.assinatura.findFirst({ where: { clienteId: id } });
    if (possuiAssinatura) {
      return res.status(400).json({ erro: "Não é possível remover um cliente vinculado a assinaturas." });
    }

    await prisma.cliente.delete({ where: { id } });
    res.json({ mensagem: "Cliente removido com sucesso." });
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ erro: "Cliente não encontrado." });
    res.status(500).json({ erro: "Erro ao deletar cliente." });
  }
}

module.exports = { listarClientes, buscarCliente, criarCliente, atualizarCliente, deletarCliente };
