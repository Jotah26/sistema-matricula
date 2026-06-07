// libreria: winston — Logger (equivalente a Logback en Java)
// libreria: exceljs — Generación de reportes Excel (equivalente a Apache POI)
// libreria: fs-extra — Escritura de archivos Excel (equivalente a Apache Commons IO)
// reporteController.js — GET /reportes/matriculas (lista) y /reportes/stats (estadísticas)
const Matricula = require("../models/Matricula");
const Admin = require("../models/Admin");
const logger = require("../services/logger");
const ExcelJS = require("exceljs");
const fse = require("fs-extra");
const path = require("path");

const reporteController = {
  matriculas: async (req, res) => {
    try {
      const { periodo } = req.query;
      const admin = new Admin();
      const data = await admin.generarReporte("matriculas", periodo || new Date().getFullYear());
      return res.json(data);
    } catch (err) {
      logger.error(err);
      return res.status(500).json({ message: "Error al generar reporte." });
    }
  },

  // libreria: ExcelJS — Genera un archivo Excel descargable con el reporte de matrículas
  descargarExcel: async (req, res) => {
    try {
      const { periodo } = req.query;
      const anio = periodo || new Date().getFullYear();
      const admin = new Admin();
      const data = await admin.generarReporte("matriculas", anio);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema de Matrícula";
      workbook.created = new Date();
      const sheet = workbook.addWorksheet(`Matrículas ${anio}`);

      sheet.columns = [
        { header: "ID", key: "idMatricula", width: 10 },
        { header: "Alumno", key: "alumno", width: 30 },
        { header: "DNI", key: "dni", width: 15 },
        { header: "Grado", key: "grado", width: 10 },
        { header: "Sección", key: "seccion", width: 10 },
        { header: "Estado", key: "estado", width: 15 },
        { header: "Fecha Registro", key: "fechaRegistro", width: 20 },
        { header: "Apoderado", key: "apoderado", width: 30 },
      ];

      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };

      data.forEach((row) => {
        sheet.addRow(row);
      });

      const dir = path.join(__dirname, "..", "..", "reportes");
      await fse.ensureDir(dir);
      const filePath = path.join(dir, `matriculas_${anio}.xlsx`);
      await workbook.xlsx.writeFile(filePath);

      logger.info(`Reporte Excel generado: ${filePath}`);
      res.download(filePath);
    } catch (err) {
      logger.error("Error al generar Excel:", err);
      return res.status(500).json({ message: "Error al generar archivo Excel." });
    }
  },

  stats: async (req, res) => {
    try {
      const stats = await Matricula.getStats();
      return res.json(stats);
    } catch (err) {
      logger.error(err);
      return res.status(500).json({ message: "Error al obtener stats." });
    }
  },
};

module.exports = reporteController;