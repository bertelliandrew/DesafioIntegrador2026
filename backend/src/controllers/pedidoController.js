const db = require("../dados");

function listarPedidos(req, res) {
  res.json(db.pedidos);
}

function buscarPedido(req, res) {
  const id = parseInt(req.params.id);
  const pedido = db.pedidos.find((p) => p.id === id);

  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado." });
  }

  res.json(pedido);
}

function criarPedido(req, res) {
  const { clienteId, produtos, categoria } = req.body;

  const clienteExiste = db.clientes.find((c) => c.id === clienteId);
  if (!clienteExiste) {
    return res.status(400).json({ erro: "Cliente não encontrado." });
  }

  let total = 0;
  const itensDoPedido = [];

  for (const item of produtos) {
    const produto = db.produtos.find((p) => p.id === item.produtoId);

    if (!produto) {
      return res.status(400).json({ erro: `Produto com id ${item.produtoId} não encontrado.` });
    }

    if (produto.estoque < item.quantidade) {
      return res.status(400).json({ erro: `Estoque insuficiente para o produto "${produto.nome}".` });
    }

    total += produto.preco * item.quantidade;

    itensDoPedido.push({
      produtoId: produto.id,
      nomeProduto: produto.nome,
      quantidade: item.quantidade,
      precoUnitario: produto.preco,
    });
  }

  for (const item of itensDoPedido) {
    const index = db.produtos.findIndex((p) => p.id === item.produtoId);
    db.produtos[index].estoque -= item.quantidade;
  }

  const novoPedido = {
    id: db.gerarIdPedido(),
    clienteId,
    nomeCliente: clienteExiste.nome,
    produtos: itensDoPedido,
    categoria: categoria || null,
    total: parseFloat(total.toFixed(2)),
    criadoEm: new Date().toISOString(),
  };

  db.pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
}

function deletarPedido(req, res) {
  const id = parseInt(req.params.id);
  const index = db.pedidos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Pedido não encontrado." });
  }

  db.pedidos.splice(index, 1);
  res.json({ mensagem: "Pedido removido com sucesso." });
}

module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  deletarPedido,
};
