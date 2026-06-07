// NotificadorApoderado.js — Observer: notifica al apoderado sobre cambios de estado o eliminación
const Observador = require("./Observador");
const store = require("../services/NotificacionStore");
const pool = require("../config/db");

class NotificadorApoderado extends Observador {
  constructor(evento, correo = "", telefono = "") {
    super();
    this.evento = evento;
    this.correo = correo;
    this.telefono = telefono;
  }

  async actualizar(data) {
    if (this.evento === "matricula_estado") {
      try {
        const [rows] = await pool.query(
          `SELECT ap.idUsuario, CONCAT(al.nombre, ' ', al.apellido) AS alumno_nombre
           FROM Matricula m
           JOIN Alumno al ON m.idAlumno = al.idAlumno
           JOIN Apoderado ap ON al.idApoderado = ap.idApoderado
           WHERE m.idMatricula = ?`,
          [data.idMatricula]
        );
        if (rows.length) {
          const verb = data.estadoNuevo === "PENDIENTE" ? "está" : "fue";
          const label = {
            APROBADA: "aprobada", RECHAZADA: "rechazada", PENDIENTE: "pendiente",
          }[data.estadoNuevo] || data.estadoNuevo.toLowerCase();
          const tipo = data.estadoNuevo === "APROBADA"
            ? "success" : data.estadoNuevo === "RECHAZADA" ? "danger" : "warning";
          store.agregar({
            mensaje: `Matrícula de ${rows[0].alumno_nombre} ${verb} ${label}`,
            tipo, rol: "Apoderado", idUsuario: rows[0].idUsuario, idMatricula: data.idMatricula,
          });
        }
      } catch (err) {
        const logger = require("../services/logger");
        logger.error("[NotificadorApoderado] Error:", err.message);
      }
    }

    if (this.evento === "matricula_eliminada") {
      if (!data.idUsuarioApoderado) return;
      store.agregar({
        mensaje: `Matrícula de ${data.alumnoNombre} eliminada del sistema`,
        tipo: "danger", rol: "Apoderado", idUsuario: data.idUsuarioApoderado,
      });
    }
  }
}
module.exports = NotificadorApoderado;
