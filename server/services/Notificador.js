// Notificador.js — EventEmitter singleton: patrón pub/sub para notificaciones
const EventEmitter = require("events");

class Notificador extends EventEmitter {
  constructor() {
    super();
    this.observadores = [];
  }

  suscribir(obs) {
    this.observadores.push(obs);
    const evento = obs.evento || "matricula_estado";
    this.on(evento, (data) => obs.actualizar(data));
  }

  desuscribir(obs) {
    const idx = this.observadores.indexOf(obs);
    if (idx !== -1) {
      this.observadores.splice(idx, 1);
      const evento = obs.evento || "matricula_estado";
      this.removeListener(evento, obs.actualizar);
    }
  }

  notificar(evento, data) {
    this.emit(evento, { ...data, timestamp: new Date().toISOString() });
  }
}

const instancia = new Notificador();

module.exports = instancia;
