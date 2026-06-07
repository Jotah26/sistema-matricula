// recuperar.js — verificación de identidad (DNI + correo) y restablecimiento de contraseña
let idUsuarioVerificado = null;

document.getElementById("togglePwd")?.addEventListener("click", () => {
  const pwd = document.getElementById("nuevaContrasena");
  const icon = document.getElementById("eyeIcon");
  const esTexto = pwd.type === "password";
  pwd.type = esTexto ? "text" : "password";
  icon.classList.toggle("fa-eye", !esTexto);
  icon.classList.toggle("fa-eye-slash", esTexto);
});

function validarPassword(pass) {
  const faltan = [];
  if (pass.length < 8) faltan.push("mínimo 8 caracteres");
  if (!/[a-z]/.test(pass)) faltan.push("una minúscula");
  if (!/[A-Z]/.test(pass)) faltan.push("una mayúscula");
  if (!/[0-9]/.test(pass)) faltan.push("un número");
  if (!/[^A-Za-z0-9]/.test(pass)) faltan.push("un carácter especial");
  return faltan;
}

function actualizarRequisitosPass(val) {
  const reqs = [
    { id: 'req-len',     test: val.length >= 8 },
    { id: 'req-lower',   test: /[a-z]/.test(val) },
    { id: 'req-upper',   test: /[A-Z]/.test(val) },
    { id: 'req-num',     test: /[0-9]/.test(val) },
    { id: 'req-special', test: /[^A-Za-z0-9]/.test(val) },
  ];
  reqs.forEach(r => {
    const el = document.getElementById(r.id);
    if (el) {
      el.querySelector('i').className = r.test ? 'bi bi-check-circle-fill text-success' : 'bi bi-circle text-muted';
      el.style.color = r.test ? '#1e8a49' : '';
    }
  });
}

document.getElementById("nuevaContrasena")?.addEventListener("input", function () {
  actualizarRequisitosPass(this.value);
});

document.getElementById("btnVerificar").addEventListener("click", verificarIdentidad);
document.getElementById("btnRestablecer").addEventListener("click", restablecerContrasena);

document.querySelectorAll("#dni, #correo").forEach(el => {
  el.addEventListener("keydown", e => {
    if (e.key === "Enter") verificarIdentidad();
  });
});

document.querySelectorAll("#nuevaContrasena, #confirmarContrasena").forEach(el => {
  el.addEventListener("keydown", e => {
    if (e.key === "Enter") restablecerContrasena();
  });
});

function mostrarError(msg) {
  const el = document.getElementById("errorMsg");
  document.getElementById("errorText").textContent = msg;
  el.classList.remove("d-none");
  document.getElementById("successMsg").classList.add("d-none");
}

function mostrarExito(msg) {
  const el = document.getElementById("successMsg");
  document.getElementById("successText").textContent = msg;
  el.classList.remove("d-none");
  document.getElementById("errorMsg").classList.add("d-none");
}

function ocultarAlertas() {
  document.getElementById("errorMsg").classList.add("d-none");
  document.getElementById("successMsg").classList.add("d-none");
}

async function verificarIdentidad() {
  ocultarAlertas();
  const dni = document.getElementById("dni").value.trim();
  const correo = document.getElementById("correo").value.trim().toLowerCase();

  if (!dni || dni.length !== 8) {
    mostrarError("Ingresa un DNI válido de 8 dígitos.");
    return;
  }
  if (!correo) {
    mostrarError("Ingresa tu correo electrónico.");
    return;
  }

  const btn = document.getElementById("btnVerificar");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';

  try {
    const res = await fetch("/api/auth/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, correo }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarError(data.message || "Error al verificar identidad.");
      return;
    }

    idUsuarioVerificado = data.idUsuario;
    document.getElementById("step1").classList.add("d-none");
    document.getElementById("step2").classList.remove("d-none");
    mostrarExito("Identidad verificada. Ingresa tu nueva contraseña.");
  } catch (err) {
    mostrarError("Error de conexión. Intenta de nuevo.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Verificar';
  }
}

async function restablecerContrasena() {
  ocultarAlertas();
  const nueva = document.getElementById("nuevaContrasena").value;
  const confirmar = document.getElementById("confirmarContrasena").value;

  if (!nueva) { mostrarError("Ingresa una contraseña."); return; }
  const errs = validarPassword(nueva);
  if (errs.length) {
    mostrarError("La contraseña debe tener: " + errs.join(", ") + ".");
    return;
  }
  if (nueva !== confirmar) {
    mostrarError("Las contraseñas no coinciden.");
    return;
  }

  const btn = document.getElementById("btnRestablecer");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

  try {
    const res = await fetch("/api/auth/restablecer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario: idUsuarioVerificado, nuevaContrasena: nueva }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarError(data.message || "Error al restablecer contraseña.");
      return;
    }

    mostrarExito("Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...");
    setTimeout(() => {
      window.location.href = "/pages/login.html";
    }, 2000);
  } catch (err) {
    mostrarError("Error de conexión. Intenta de nuevo.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-save me-2"></i>Restablecer contraseña';
  }
}
