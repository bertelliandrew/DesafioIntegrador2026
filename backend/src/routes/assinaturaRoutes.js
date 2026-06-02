const express = require("express");
const router = express.Router();
const assinaturaController = require("../controllers/assinaturaController");
const { validarAssinatura, validarCancelamento } = require("../middlewares/validacoes");

router.get("/", assinaturaController.listarAssinaturas);
router.get("/:id", assinaturaController.buscarAssinatura);
router.post("/", validarAssinatura, assinaturaController.criarAssinatura);
router.put("/:id", validarAssinatura, assinaturaController.atualizarAssinatura);
router.put("/:id/cancelar", validarCancelamento, assinaturaController.cancelarAssinatura);
router.put("/:id/reativar", assinaturaController.reativarAssinatura);
router.delete("/:id", assinaturaController.deletarAssinatura);

module.exports = router;
