const db = require("../dados");

function listarClientes(req, res) {
  res.json(db.clientes);
}

function buscarCliente(req, res) {
  const id = Number(req.params.id);
  const cliente = db.clientes.find((c) => c.id === id);

  if (!cliente) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  res.json(cliente);
}

function criarCliente(req, res) {
  const { nome, email, cidade, estado, pais } = req.body;
  const emailNormalizado = email.trim().toLowerCase();

  const emailJaExiste = db.clientes.find((c) => c.email.toLowerCase() === emailNormalizado);
  if (emailJaExiste) {
    return res.status(400).json({ erro: "Já existe um cliente com esse e-mail." });
  }

  const novoCliente = {
    id: db.gerarIdCliente(),
    nome: nome.trim(),
    email: emailNormalizado,
    cidade: cidade.trim(),
    estado: estado.trim().toUpperCase(),
    pais: pais.trim(),
    criadoEm: new Date().toISOString(),
  };

  db.clientes.push(novoCliente);
  res.status(201).json(novoCliente);
}

function atualizarCliente(req, res) {
  const id = Number(req.params.id);
  const index = db.clientes.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  const { nome, email, cidade, estado, pais } = req.body;
  const emailNormalizado = email.trim().toLowerCase();

  const emailDuplicado = db.clientes.find((c) => c.email.toLowerCase() === emailNormalizado && c.id !== id);
  if (emailDuplicado) {
    return res.status(400).json({ erro: "Esse e-mail já está sendo usado por outro cliente." });
  }

  db.clientes[index] = {
    ...db.clientes[index],
    nome: nome.trim(),
    email: emailNormalizado,
    cidade: cidade.trim(),
    estado: estado.trim().toUpperCase(),
    pais: pais.trim(),
  };

  db.assinaturas.forEach((assinatura) => {
    if (assinatura.clienteId === id) {
      assinatura.nomeCliente = db.clientes[index].nome;
    }
  });

  res.json(db.clientes[index]);
}

function deletarCliente(req, res) {
  const id = Number(req.params.id);
  const possuiAssinatura = db.assinaturas.some((assinatura) => assinatura.clienteId === id);

  if (possuiAssinatura) {
    return res.status(400).json({ erro: "Não é possível remover um cliente vinculado a assinaturas." });
  }

  const index = db.clientes.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  db.clientes.splice(index, 1);
  res.json({ mensagem: "Cliente removido com sucesso." });
}

module.exports = {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  deletarCliente,
};
