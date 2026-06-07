// notificacionController.js — listar, marcar leídas, eliminar notificaciones
const store = require("../services/NotificacionStore");

const notificacionController = {
  listar: (req, res) => {
    const notificaciones = store.listar(req.user.role, req.user.id);
    return res.json({ data: notificaciones });
  },

  marcarLeidas: (req, res) => {
    const { ids } = req.body;
    if (ids === "all") {
      const todas = store.listar(req.user.role, req.user.id);
      store.marcarLeidas(todas.map(n => n.id));
      return res.json({ message: "Todas las notificaciones marcadas como leídas" });
    }
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "Se requiere un array de ids" });
    }
    store.marcarLeidas(ids);
    return res.json({ message: "Notificaciones marcadas como leídas" });
  },

  eliminar: (req, res) => {
    const id = parseInt(req.params.id);
    store.eliminar(id);
    return res.json({ message: "Notificación eliminada." });
  },
};

module.exports = notificacionController;
