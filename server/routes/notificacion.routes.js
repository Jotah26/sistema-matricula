// /api/notificaciones — listar, marcar leídas, eliminar (protegido)
const express = require("express");
const router = express.Router();
const notificacionController = require("../controllers/notificacionController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, notificacionController.listar);
router.put("/leer", verifyToken, notificacionController.marcarLeidas);
router.delete("/:id", verifyToken, notificacionController.eliminar);

module.exports = router;
