// libreria: express-validator — Validación de parámetros de consulta
// /api/reportes — reporte de matrículas y estadísticas (protegido, solo ADMIN)
const express = require("express");
const router = express.Router();
const { query, validationResult } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const reporteController = require("../controllers/reporteController");

router.get("/matriculas", verifyToken, verifyRole("Administrador"), reporteController.matriculas);
router.get("/descargar-excel", verifyToken, verifyRole("Administrador"), [
  query("periodo").optional().isInt({ min: 2000, max: 2100 }).withMessage("Periodo inválido"),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    next();
  },
], reporteController.descargarExcel);
router.get("/stats", verifyToken, reporteController.stats);

module.exports = router;