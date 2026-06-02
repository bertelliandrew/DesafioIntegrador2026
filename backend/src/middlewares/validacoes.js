function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCliente(req, res, next) {
  const { nome, email, cidade, estado, pais } = req.body;

  if (!nome || !email || !cidade || !estado || !pais) {
    return res.status(400).json({ erro: "Todos os campos do cliente são obrigatórios." });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }

  next();
}

function validarPlano(req, res, next) {
  const { nome, descricao, precoMensal, limiteDispositivos, suporte } = req.body;
  const preco = Number(precoMensal);
  const limite = Number(limiteDispositivos);

  if (!nome || !descricao || precoMensal === undefined || limiteDispositivos === undefined || !suporte) {
    return res.status(400).json({ erro: "Nome, descrição, preço mensal, limite e suporte são obrigatórios." });
  }

  if (Number.isNaN(preco) || preco <= 0) {
    return res.status(400).json({ erro: "O preço mensal deve ser maior que zero." });
  }

  if (Number.isNaN(limite) || limite <= 0) {
    return res.status(400).json({ erro: "O limite de dispositivos deve ser maior que zero." });
  }

  next();
}

function validarAssinatura(req, res, next) {
  const { clienteId, planoId, quantidadeFirewalls, ciclo } = req.body;
  const quantidade = Number(quantidadeFirewalls);

  if (!clienteId) {
    return res.status(400).json({ erro: "A assinatura precisa estar vinculada a um cliente." });
  }

  if (!planoId) {
    return res.status(400).json({ erro: "A assinatura precisa ter um plano de firewall." });
  }

  if (Number.isNaN(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: "A quantidade de firewalls deve ser maior que zero." });
  }

  if (ciclo && !["mensal", "anual"].includes(ciclo)) {
    return res.status(400).json({ erro: "O ciclo deve ser mensal ou anual." });
  }

  next();
}

function validarCancelamento(req, res, next) {
  const { motivoCancelamento } = req.body;

  if (!motivoCancelamento || motivoCancelamento.trim().length < 3) {
    return res.status(400).json({ erro: "Informe um motivo de cancelamento com pelo menos 3 caracteres." });
  }

  next();
}

module.exports = {
  validarCliente,
  validarPlano,
  validarAssinatura,
  validarCancelamento,
};
