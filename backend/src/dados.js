let clientes = [];
let produtos = [];
let pedidos = [];

let proximoIdCliente = 1;
let proximoIdProduto = 1;
let proximoIdPedido = 1;

function gerarIdCliente() {
  return proximoIdCliente++;
}

function gerarIdProduto() {
  return proximoIdProduto++;
}

function gerarIdPedido() {
  return proximoIdPedido++;
}

module.exports = {
  clientes,
  produtos,
  pedidos,
  gerarIdCliente,
  gerarIdProduto,
  gerarIdPedido,
};
