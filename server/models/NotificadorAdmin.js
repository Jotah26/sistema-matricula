// NotificadorAdmin.js — Observer: notifica al admin sobre matrículas creadas y cambios de estado
const Observador = require("./Observador");
const store = require("../services/NotificacionStore");
const pool = require("../config/db");

class NotificadorAdmin extends Observador {
  constructor(evento) {
    super();
    this.evento = evento;
  }

  async actualizar(data) {
    if (this.evento === "matricula_creada") {
      let alumnoNombre = "";
      try {
        const [rows] = await pool.query(
          `SELECT CONCAT(al.nombre, ' ', al.apellido) AS nombre
           FROM Matricula m JOIN Alumno al ON m.idAlumno = al.idAlumno
           WHERE m.idMatricula = ?`, [data.idMatricula]
        );
        if (rows.length) alumnoNombre = ` — ${rows[0].nombre}`;
      } catch (e) {}
      store.agregar({
        mensaje: `Nueva matrícula #${data.idMatricula} registrada${alumnoNombre}`,
        tipo: "info",
        rol: "Administrador",
        idMatricula: data.idMatricula,
      });
    }

    if (this.evento === "matricula_estado") {
      const tipo = data.estadoNuevo === "APROBADA"
        ? "success" : data.estadoNuevo === "RECHAZADA" ? "danger" : "warning";
      store.agregar({
        mensaje: `Matrícula #${data.idMatricula} cambió de ${data.estadoAnterior} a ${data.estadoNuevo}`,
        tipo,
        rol: "Administrador",
        idMatricula: data.idMatricula,
      });
    }
  }
}
module.exports = NotificadorAdmin;
