// libreria: winston — Logger (equivalente a Logback en Java)
// initNotificadores.js — suscribe los observers al iniciar el servidor
const notificador = require("./Notificador");
const NotificadorAdmin = require("../models/NotificadorAdmin");
const NotificadorApoderado = require("../models/NotificadorApoderado");
const logger = require("./logger");

notificador.suscribir(new NotificadorAdmin("matricula_creada"));
notificador.suscribir(new NotificadorAdmin("matricula_estado"));
notificador.suscribir(new NotificadorApoderado("matricula_estado"));
notificador.suscribir(new NotificadorApoderado("matricula_eliminada"));

logger.info("[initNotificadores] Notificaciones activas");
