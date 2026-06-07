// libreria: helmet — Seguridad HTTP (cabeceras de seguridad)
// libreria: winston — Logger (equivalente a Logback en Java)
// server.js — punto de entrada, configura Express y monta todas las rutas
require("dotenv").config({ override: false });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const logger = require("./server/services/logger");

const app = express();

require("./server/services/initNotificadores");

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));

// ===== RUTAS DE AUTENTICACIÓN =====
app.use("/api/auth", require("./server/routes/auth.routes"));

// ===== RUTAS DE MANTENIMIENTO =====
app.use("/api/usuarios", require("./server/routes/usuario.routes"));
app.use("/api/alumnos", require("./server/routes/alumno.routes"));
app.use("/api/apoderados", require("./server/routes/apoderado.routes"));
app.use("/api/matriculas", require("./server/routes/matricula.routes"));
app.use("/api/secciones", require("./server/routes/seccion.routes"));

// ===== RUTAS DE REPORTES E HISTORIAL =====
app.use("/api/historial", require("./server/routes/historial.routes"));
app.use("/api/reportes", require("./server/routes/reporte.routes"));
app.use("/api/notificaciones", require("./server/routes/notificacion.routes"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Servidor iniciado en http://localhost:${PORT}`));
