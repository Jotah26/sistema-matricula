// guard.js — protección cliente: redirige al login si no hay sesión o rol incorrecto
(function () {
  const raw  = sessionStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  /* Sin sesión → login */
  if (!user || !user.token) {
    window.location.replace("/pages/login.html");
    return;
  }

  /* Páginas exclusivas del Administrador */
  const soloAdmin = [
    "dashboardAdmin.html",
    "usuarios.html",
    "gestionVacantes.html",
    "reporte.html",
    "matriculaAdmin.html",
    "gestionMatriculas.html",
    "gestionVacantes.html",
  ];

  /* Páginas exclusivas del Apoderado */
  const soloApoderado = [
    "dashboardApoderado.html",
    "perfilApoderado.html",
    "matriculaApoderado.html",
  ];

  const paginaActual = location.pathname.split("/").pop();

  if (soloAdmin.includes(paginaActual) && user.role !== "Administrador") {
    window.location.replace("/pages/login.html");
    return;
  }

  if (soloApoderado.includes(paginaActual) && user.role !== "Apoderado") {
    window.location.replace("/pages/login.html");
    return;
  }
})();