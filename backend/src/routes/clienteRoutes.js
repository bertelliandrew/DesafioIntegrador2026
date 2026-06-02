const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const { validarCliente } = require("../middlewares/validacoes");

router.get("/", clienteController.listarClientes);
router.get("/:id", clienteController.buscarCliente);
router.post("/", validarCliente, clienteController.criarCliente);
router.put("/:id", validarCliente, clienteController.atualizarCliente);
router.delete("/:id", clienteController.deletarCliente);

module.exports = router;
