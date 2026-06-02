function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCliente(req, res, next) {
  const { nome, email, cidade, estado, pais } = req.body;

  if (!nome || !email || !cidade || !estado || !pais) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  next();
}

function validarProduto(req, res, next) {
  const { nome, preco, estoque } = req.body;

  if (!nome || preco === undefined || estoque === undefined) {
    return res.status(400).json({ erro: "Nome, preço e estoque são obrigatórios." });
  }

  if (preco <= 0) {
    return res.status(400).json({ erro: "O preço deve ser maior que zero." });
  }

  if (estoque < 0) {
    return res.status(400).json({ erro: "O estoque não pode ser negativo." });
  }

  next();
}

function validarPedido(req, res, next) {
  const { clienteId, produtos } = req.body;

  if (!clienteId) {
    return res.status(400).json({ erro: "O pedido precisa de um cliente." });
  }

  if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ erro: "O pedido precisa ter pelo menos um produto." });
  }

  next();
}

module.exports = { validarCliente, validarProduto, validarPedido };
