// libreria: winston — Logger (equivalente a Logback en Java)
// verifyToken.js — verifica JWT en cada petición, adjunta req.user
const jwt = require("jsonwebtoken");
const logger = require("../services/logger");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token no encontrado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, role }
    next();
  } catch (err) {
    logger.warn(`Token inválido: ${err.message}`);
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
}

module.exports = verifyToken;