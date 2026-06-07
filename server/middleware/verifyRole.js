// libreria: winston — Logger (equivalente a Logback en Java)
// verifyRole.js — restringe rutas por rol (Administrador, Apoderado)
function verifyRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Sin autenticación." });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(" o ")}.`,
      });
    }

    next();
  };
}

module.exports = verifyRole;