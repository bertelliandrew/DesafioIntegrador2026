const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const { validarPedido } = require("../middlewares/validacoes");

router.get("/", pedidoController.listarPedidos);
router.get("/:id", pedidoController.buscarPedido);
router.post("/", validarPedido, pedidoController.criarPedido);
router.delete("/:id", pedidoController.deletarPedido);

module.exports = router;
