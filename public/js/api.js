// api.js — wrapper de fetch: adjunta JWT automáticamente, redirige al login si token vence

async function apiFetch(endpoint, options = {}) {
  const raw   = sessionStorage.getItem("user");
  const user  = raw ? JSON.parse(raw) : {};
  const token = user.token || "";

  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    /* Token vencido o inválido → echar al login */
    if (res.status === 401 || res.status === 403) {
      sessionStorage.clear();
      window.location.replace("/pages/login.html");
      return null;
    }

    /* Error HTTP (500, 400, etc.) → devolver como error */
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || `Error HTTP ${res.status}` };
    }

    return await res.json();

  } catch (err) {
    console.error("Error en apiFetch:", err);
    return null;
  }
}