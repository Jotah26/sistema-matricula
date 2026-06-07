// UsuarioFactory.js — crea Admin o Apoderado según rol (patrón Factory)
const Usuario = require("./Usuario");
const Admin = require("./Admin");
const Apoderado = require("./Apoderado");
const pool = require("../config/db");

class UsuarioFactory {
  static crearUsuario(rol, datos) {
    if (!UsuarioFactory.validarRol(rol)) {
      throw new Error(`Rol no válido: ${rol}`);
    }
    switch (rol) {
      case "ADMIN":
        return new Admin(datos);
      case "APODERADO":
        return new Apoderado(datos);
      default:
        throw new Error(`Rol no implementado: ${rol}`);
    }
  }

  static validarRol(rol) {
    return ["ADMIN", "APODERADO"].includes(rol);
  }

  static async login(correo, contraseña) {
    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE correo = ?", [correo]
    );
    if (rows.length === 0) return null;

    const usuario = rows[0];
    const bcrypt = require("bcryptjs");

    // TEMPORAL: descomentar si los hashes $2b$ no son compatibles con bcryptjs
    // if (!usuario.contraseña.startsWith("$2a$")) {
    //   const nuevoHash = bcrypt.hashSync(contraseña, 10);
    //   await pool.query(
    //     "UPDATE Usuario SET contraseña = ? WHERE idUsuario = ?",
    //     [nuevoHash, usuario.idUsuario]
    //   );
    //   usuario.contraseña = nuevoHash;
    // }

    const ok = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!ok) return null;

    const userInstance = UsuarioFactory.crearUsuario(usuario.rol, usuario);
    userInstance.idUsuario = usuario.idUsuario;

    if (usuario.rol === "ADMIN") {
      const [adminRows] = await pool.query(
        "SELECT idAdmin FROM Admin WHERE idUsuario = ?", [usuario.idUsuario]
      );
      if (adminRows.length) userInstance.idAdmin = adminRows[0].idAdmin;
    } else if (usuario.rol === "APODERADO") {
      const [apoRows] = await pool.query(
        "SELECT idApoderado, dni, telefono, direccion, parentesco FROM Apoderado WHERE idUsuario = ?",
        [usuario.idUsuario]
      );
      if (apoRows.length) {
        userInstance.idApoderado = apoRows[0].idApoderado;
        userInstance.dni = apoRows[0].dni;
        userInstance.telefono = apoRows[0].telefono;
        userInstance.direccion = apoRows[0].direccion;
        userInstance.parentesco = apoRows[0].parentesco;
      }
    }

    return userInstance;
  }
}

module.exports = UsuarioFactory;
