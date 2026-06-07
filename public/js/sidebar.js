// sidebar.js — construye el menú lateral según el rol, con toggle responsive y logout
(function () {

    // Menús por rol
    const MENUS = {
        Administrador: [
            { label: "Principal" },
            { icon: "bi-house-door", text: "Inicio", href: "/pages/dashboardAdmin.html" },
            { icon: "bi-people", text: "Usuarios", href: "/pages/usuarios.html" },
            { label: "Gestión" },
            { icon: "bi-file-earmark-plus", text: "Nueva Matrícula", href: "/pages/matriculaAdmin.html" },
            { icon: "bi-list-check", text: "Matrículas", href: "/pages/gestionMatriculas.html" },
            { icon: "bi-grid", text: "Vacantes", href: "/pages/gestionVacantes.html" },
            { icon: "bi-bar-chart", text: "Reportes", href: "/pages/reporte.html" },
        ],
        Apoderado: [
            { label: "Principal" },
            { icon: "bi-house-door", text: "Inicio", href: "/pages/dashboardApoderado.html" },
            { icon: "bi-person-circle", text: "Mi perfil", href: "/pages/perfilApoderado.html" },
            { icon: "bi-file-earmark-plus", text: "Matricular hijo", href: "/pages/matriculaApoderado.html" },
        ],
    };

    function getSession() {
        const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    }

    function buildNav(role) {
        const nav = document.getElementById("sidebarNav");
        const menu = MENUS[role] || [];
        if (!nav) return;
        nav.innerHTML = menu.map(function (item) {
            if (item.label) {
                var sectionClass = item.label === "Gestión" ? "px-4 mt-3 mb-2" : "px-4 mb-2";
                return '<div class="' + sectionClass + '">' +
                    '<small class="text-uppercase text-secondary" style="font-size:0.7rem;letter-spacing:0.1em">' + item.label + '</small>' +
                    '</div>';
            }
            var isActive = location.pathname.endsWith(item.href.split("/").pop()) ? "nav-link-active" : "nav-link-custom";
            return '<a href="' + item.href + '" class="nav-link ' + isActive + ' py-2 px-4 d-flex align-items-center gap-2">' +
                '<i class="bi ' + item.icon + '"></i>' + item.text +
                '</a>';
        }).join("");

        // Cerrar sidebar al hacer clic en un enlace (móvil)
        nav.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", closeSidebar);
        });
    }

    function fillUser(session) {
        var nameEl = document.getElementById("sidebarUserName");
        var roleEl = document.getElementById("sidebarUserRole");
        if (nameEl) nameEl.textContent = session && session.name || "Usuario";
        if (roleEl) roleEl.textContent = session && session.role || "";
    }

    // ---- Responsive toggle ----

    var toggleBtn = null;
    var overlay = null;

    function closeSidebar() {
        var container = document.getElementById("sidebar-container");
        if (container) container.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
    }

    function openSidebar() {
        var container = document.getElementById("sidebar-container");
        if (container) container.classList.add("open");
        if (overlay) overlay.classList.add("show");
    }

    function toggleSidebar() {
        var container = document.getElementById("sidebar-container");
        if (container && container.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function setupToggle() {
        if (toggleBtn) return;

        // Toggle button
        toggleBtn = document.createElement("button");
        toggleBtn.className = "sidebar-toggle";
        toggleBtn.id = "sidebarToggle";
        toggleBtn.setAttribute("aria-label", "Abrir menú");
        toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
        toggleBtn.addEventListener("click", toggleSidebar);
        document.body.appendChild(toggleBtn);

        // Overlay
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        overlay.id = "sidebarOverlay";
        overlay.addEventListener("click", closeSidebar);
        document.body.appendChild(overlay);

        // Close button inside sidebar
        var closeBtn = document.getElementById("sidebarClose");
        if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    }

    // Logout
    document.addEventListener("click", function (e) {
        if (e.target.closest("#btnLogout")) {
            if (window.__stopNotifPolling) window.__stopNotifPolling();
            sessionStorage.removeItem("user");
            sessionStorage.clear();
            window.location.href = "/pages/login.html";
        }
    });

    // Init
    function init() {
        var session = getSession();
        if (!session) { window.location.href = "/pages/login.html"; return; }
        fillUser(session);
        buildNav(session.role);
        setupToggle();
    }
    init();

})();
