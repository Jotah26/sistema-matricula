// login.js — toma credenciales, llama a /api/auth/login, guarda token y redirige según rol
document.getElementById("togglePwd").addEventListener("click", () => {
  const pwd = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");
  const esTexto = pwd.type === "password";
  pwd.type = esTexto ? "text" : "password";
  icon.classList.toggle("fa-eye", !esTexto);
  icon.classList.toggle("fa-eye-slash", esTexto);
});

document.getElementById("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

document.getElementById("btnLogin").addEventListener("click", login);

async function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("btnLogin");

  if (!email || !password) {
    showNotification("error", "Campos incompletos", "Completa todos los campos.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...`;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", "Error de inicio", data.message || "Correo o contraseña incorrectos.");
      return;
    }

    sessionStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      role: data.user.role,
      parentesco: data.user.parentesco,
      token: data.token,
    }));

    const destinos = {
      Administrador: "../pages/dashboardAdmin.html",
      Apoderado: "../pages/dashboardApoderado.html",
    };

    window.location.href = destinos[data.user.role] || "/pages/login.html";
  } catch (err) {
    showNotification("error", "Error de conexión", "No se pudo conectar con el servidor. Intenta de nuevo.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-right-to-bracket me-2"></i>Ingresar`;
  }
}
