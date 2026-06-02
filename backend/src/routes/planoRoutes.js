const express = require("express");
const router = express.Router();
const planoController = require("../controllers/planoController");
const { validarPlano } = require("../middlewares/validacoes");

router.get("/", planoController.listarPlanos);
router.get("/:id", planoController.buscarPlano);
router.post("/", validarPlano, planoController.criarPlano);
router.put("/:id", validarPlano, planoController.atualizarPlano);
router.delete("/:id", planoController.deletarPlano);

module.exports = router;
