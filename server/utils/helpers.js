// libreria: lodash — Utilidades para colecciones, strings y objetos (equivalente a Google Guava)
// libreria: uuid — Generación de IDs únicos (equivalente a java.util.UUID de Apache Commons)
// libreria: date-fns — Formateo y manipulación de fechas (equivalente a Apache Commons Lang3)
// libreria: validator — Validación de strings (equivalente a Apache Commons Validator)
// libreria: fs-extra — Operaciones de archivos (equivalente a Apache Commons IO)
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const { format, formatDistanceToNow, parseISO } = require("date-fns");
const { es } = require("date-fns/locale");
const validator = require("validator");
const fse = require("fs-extra");

module.exports = {
  // ===== LODASH =====
  pick: _.pick,
  omit: _.omit,
  groupBy: _.groupBy,
  orderBy: _.orderBy,
  chunk: _.chunk,
  capitalize: _.capitalize,
  isEmpty: _.isEmpty,
  isNil: _.isNil,
  uniqBy: _.uniqBy,
  keyBy: _.keyBy,
  mapKeys: _.mapKeys,
  template: _.template,

  // ===== UUID =====
  generarId: () => uuidv4(),

  // ===== DATE-FNS =====
  formatFecha: (fecha, fmt = "yyyy-MM-dd") => format(new Date(fecha), fmt),
  formatFechaHora: (fecha) => format(new Date(fecha), "yyyy-MM-dd HH:mm:ss"),
  tiempoDesde: (fecha) => formatDistanceToNow(new Date(fecha), { locale: es, addSuffix: true }),

  // ===== VALIDATOR =====
  esEmail: (v) => validator.isEmail(v),
  esDNI: (v) => /^\d{8}$/.test(v),
  esTelefono: (v) => validator.isMobilePhone(v, "es-PE"),
  sanitizar: (v) => validator.escape(v || ""),

  // ===== FS-EXTRA =====
  leerArchivo: (path) => fse.readJson(path),
  escribirArchivo: (path, data) => fse.writeJson(path, data, { spaces: 2 }),
  copiarArchivo: (src, dest) => fse.copy(src, dest),
  asegurarDir: (dir) => fse.ensureDir(dir),
  existeArchivo: (path) => fse.pathExists(path),
};
