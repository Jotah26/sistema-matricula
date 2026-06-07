// NotificacionStore.js — almacén en memoria (máx 100 notificaciones), filtrado por rol
class NotificacionStore {
  constructor() {
    this._items = [];
    this._counter = 1;
    this._max = 100;
  }

  agregar({ mensaje, tipo, rol, idUsuario, idMatricula }) {
    const n = {
      id: this._counter++,
      mensaje,
      tipo: tipo || "info",
      rol,
      idUsuario: idUsuario || null,
      idMatricula: idMatricula || null,
      leida: false,
      timestamp: new Date().toISOString(),
    };
    this._items.unshift(n);
    if (this._items.length > this._max) this._items.pop();
    return n;
  }

  listar(rol, idUsuario) {
    if (rol === "Administrador")
      return this._items.filter(n => n.rol === "Administrador");
    return this._items.filter(
      n => n.rol === "Apoderado" && n.idUsuario === idUsuario
    );
  }

  marcarLeidas(ids) {
    for (const n of this._items) {
      if (ids.includes(n.id)) n.leida = true;
    }
  }

  eliminar(id) {
    const idx = this._items.findIndex(n => n.id === id);
    if (idx !== -1) this._items.splice(idx, 1);
  }
}

module.exports = new NotificacionStore();
