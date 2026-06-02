const db = require("../dados");

function listarClientes(req, res) {
  res.json(db.clientes);
}

function buscarCliente(req, res) {
  const id = parseInt(req.params.id);
  const cliente = db.clientes.find((c) => c.id === id);

  if (!cliente) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  res.json(cliente);
}

function criarCliente(req, res) {
  const { nome, email, cidade, estado, pais } = req.body;

  const emailJaExiste = db.clientes.find((c) => c.email === email);
  if (emailJaExiste) {
    return res.status(400).json({ erro: "Já existe um cliente com esse email." });
  }

  const novoCliente = {
    id: db.gerarIdCliente(),
    nome,
    email,
    cidade,
    estado,
    pais,
    criadoEm: new Date().toISOString(),
  };

  db.clientes.push(novoCliente);
  res.status(201).json(novoCliente);
}

function atualizarCliente(req, res) {
  const id = parseInt(req.params.id);
  const index = db.clientes.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  const { nome, email, cidade, estado, pais } = req.body;

  const emailDuplicado = db.clientes.find((c) => c.email === email && c.id !== id);
  if (emailDuplicado) {
    return res.status(400).json({ erro: "Esse email já está sendo usado por outro cliente." });
  }

  db.clientes[index] = {
    ...db.clientes[index],
    nome,
    email,
    cidade,
    estado,
    pais,
  };

  res.json(db.clientes[index]);
}

function deletarCliente(req, res) {
  const id = parseInt(req.params.id);
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
