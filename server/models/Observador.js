// Observador.js — interfaz base para el patrón Observer
class Observador {
  actualizar(evento) {
    throw new Error("Método actualizar() debe ser implementado");
  }
}
module.exports = Observador;
