const db = require("../dados");

function listarProdutos(req, res) {
  res.json(db.produtos);
}

function buscarProduto(req, res) {
  const id = parseInt(req.params.id);
  const produto = db.produtos.find((p) => p.id === id);

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  res.json(produto);
}

function criarProduto(req, res) {
  const { nome, preco, estoque, categoria } = req.body;

  const novoProduto = {
    id: db.gerarIdProduto(),
    nome,
    preco: parseFloat(preco),
    estoque: parseInt(estoque),
    categoria: categoria || null,
    criadoEm: new Date().toISOString(),
  };

  db.produtos.push(novoProduto);
  res.status(201).json(novoProduto);
}

function atualizarProduto(req, res) {
  const id = parseInt(req.params.id);
  const index = db.produtos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  const { nome, preco, estoque, categoria } = req.body;

  db.produtos[index] = {
    ...db.produtos[index],
    nome,
    preco: parseFloat(preco),
    estoque: parseInt(estoque),
    categoria: categoria || null,
  };

  res.json(db.produtos[index]);
}

function deletarProduto(req, res) {
  const id = parseInt(req.params.id);
  const index = db.produtos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  db.produtos.splice(index, 1);
  res.json({ mensagem: "Produto removido com sucesso." });
}

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
};
