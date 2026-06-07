// reporte.js — cargar reporte, exportar a PDF (jsPDF) y Excel (SheetJS)
fetch("/components/sidebar.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("sidebar-container").innerHTML = html;
    const s = document.createElement("script");
    s.src = "/js/sidebar.js";
    document.body.appendChild(s);
  });

const ESTADOS = { APROBADA: "bg-success", PENDIENTE: "bg-warning text-dark", RECHAZADA: "bg-danger" };

document.getElementById("fechaGenerado").textContent =
  new Date().toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });

async function cargarReporte() {
  try {
    const stats = await apiFetch("/reportes/stats");
    if (stats) {
      document.getElementById("kpiTotal").textContent = stats.total_matriculas || 0;
      document.getElementById("kpiAprobadas").textContent = stats.aprobadas || 0;
      document.getElementById("kpiPendientes").textContent = stats.pendientes || 0;
      document.getElementById("kpiRechazadas").textContent = stats.rechazadas || 0;
    }

    const data = await apiFetch("/reportes/matriculas?periodo=2026");
    const tbody = document.getElementById("reporteBody");
    if (data && data.length) {
      tbody.innerHTML = data.map((r, i) => {
        const idx = String(i + 1).padStart(3, "0");
        const badge = ESTADOS[r.estado] || "bg-secondary";
        return `<tr>
          <td class="ps-4 text-muted">${idx}</td>
          <td class="fw-medium">${r.alumno || "—"}</td>
          <td>${r.dni || "—"}</td>
          <td>${r.grado || "—"}</td>
          <td>${r.seccion || "—"}</td>
          <td><span class="badge ${badge} px-3">${r.estado || "—"}</span></td>
          <td>${r.fechaRegistro ? new Date(r.fechaRegistro).toLocaleDateString("es-PE") : "—"}</td>
        </tr>`;
      }).join("");
      document.getElementById("infoRegistros").textContent =
        "Página 1 de 1";
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay datos disponibles</td></tr>';
      document.getElementById("infoRegistros").textContent = "Página 0 de 0";
    }
  } catch (e) {
    console.error("Error cargando reporte:", e);
    showErrorAlert("Error al cargar los datos del reporte.");
  }
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const azul = [10, 22, 40];
  const gris = [245, 247, 251];

  try {
    const logo = new Image();
    logo.src = "/images/logo.png";
    await new Promise((resolve) => { logo.onload = resolve; logo.onerror = resolve; });
    doc.addImage(logo, "PNG", 14, 10, 20, 20);
  } catch (e) {}

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("I.E. PEDRO LABARTHE", 37, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(80);
  doc.text("Institución Educativa Pedro Labarthe", 37, 18);
  doc.text("Sistema de Gestión de Matrículas", 37, 22);

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Reporte de Matrículas", 105, 17, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text("Periodo Académico 2026", 105, 24, { align: "center" });

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(148, 8, 48, 24);
  doc.setFontSize(7.5);
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.text("Fecha:", 151, 14);
  doc.text("Generado por:", 151, 18.5);
  doc.text("Cargo:", 151, 23);
  doc.text("Periodo:", 151, 27.5);
  doc.setFont("helvetica", "normal");

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  doc.text(new Date().toLocaleDateString("es-PE"), 168, 14);
  doc.text(user.name || "—", 168, 18.5);
  doc.text(user.role || "—", 168, 23);
  doc.text("2026", 168, 27.5);

  doc.setDrawColor(180);
  doc.setLineWidth(0.4);
  doc.line(14, 35, 196, 35);

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. RESUMEN GENERAL", 14, 43);

  showNotification("loading", "Exportando PDF...", "Generando el documento, por favor espera.", 0);
  const stats = await apiFetch("/reportes/stats") || {};
  const resumen = [
    { titulo: "TOTAL MATRÍCULAS", valor: String(stats.total_matriculas || 0), bg: [10, 22, 40], vBg: [184, 198, 224] },
    { titulo: "APROBADAS",        valor: String(stats.aprobadas || 0),        bg: [10, 22, 40], vBg: [197, 220, 197] },
    { titulo: "PENDIENTES",       valor: String(stats.pendientes || 0),       bg: [10, 22, 40], vBg: [232, 221, 184] },
    { titulo: "RECHAZADAS",       valor: String(stats.rechazadas || 0),       bg: [10, 22, 40], vBg: [225, 195, 198] },
  ];

  const colW = 45.5;
  let rx = 14;
  const ry = 47;
  resumen.forEach((card) => {
    doc.setFillColor(...card.bg);
    doc.rect(rx, ry, colW, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(card.titulo, rx + colW / 2, ry + 5.8, { align: "center" });
    doc.setFillColor(...card.vBg);
    doc.rect(rx, ry + 9, colW, 12, "F");
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(card.valor, rx + colW / 2, ry + 17, { align: "center" });
    rx += colW;
  });

  doc.setTextColor(...azul);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. DETALLE DE MATRÍCULAS", 14, 76);

  const filas = [];
  document.querySelectorAll("#tablaReporte tbody tr").forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 7) {
      filas.push([
        tds[0].innerText.trim(), tds[1].innerText.trim(),
        tds[2].innerText.trim(), tds[3].innerText.trim(),
        tds[4].innerText.trim(), tds[5].innerText.trim(),
        tds[6].innerText.trim(),
      ]);
    }
  });

  doc.autoTable({
    startY: 80,
    head: [["N°", "Alumno", "DNI", "Grado", "Sección", "Estado", "Fecha"]],
    body: filas,
    theme: "grid",
    headStyles: {
      fillColor: azul, textColor: 255, halign: "center",
      valign: "middle", fontStyle: "bold", fontSize: 8.5,
    },
    styles: { fontSize: 8, cellPadding: 3, valign: "middle", textColor: 40 },
    alternateRowStyles: { fillColor: gris },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 45 },
      2: { halign: "center", cellWidth: 28 },
      3: { cellWidth: 35 },
      4: { halign: "center", cellWidth: 18 },
      5: { halign: "center", cellWidth: 25 },
      6: { halign: "center", cellWidth: 23 },
    },
  });

  const paginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: "center" });
  }
  doc.save("Reporte_Matriculas_2026.pdf");
  document.querySelectorAll('.notif-stack .notif').forEach(function(d) {
    if (typeof removeNotification === 'function') removeNotification(d);
    else d.remove();
  });
  showSuccessAlert("PDF exportado correctamente.");
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const data = [
    ["REPORTE DE MATRÍCULAS"],
    ["I.E. PEDRO LABARTHE"],
    ["Periodo Académico 2026"],
    [],
    ["N°", "Alumno", "DNI", "Grado", "Sección", "Estado", "Fecha"],
  ];

  document.querySelectorAll("#tablaReporte tbody tr").forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 7) {
      const fila = [];
      tds.forEach((td) => {
        const badge = td.querySelector(".badge");
        fila.push(badge ? badge.textContent.trim() : td.textContent.trim());
      });
      data.push(fila);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 8 }, { wch: 35 }, { wch: 18 }, { wch: 22 },
    { wch: 12 }, { wch: 18 }, { wch: 18 },
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
  ];

  const azul = "0A1628";
  const blanco = "FFFFFF";
  const gris = "F5F7FA";

  ws["A1"].s = { font: { bold: true, sz: 18, color: { rgb: blanco } }, fill: { fgColor: { rgb: azul } }, alignment: { horizontal: "center", vertical: "center" } };
  ws["A2"].s = { font: { bold: true, sz: 13 }, alignment: { horizontal: "center" } };
  ws["A3"].s = { font: { italic: true, sz: 11, color: { rgb: "666666" } }, alignment: { horizontal: "center" } };

  ["A5","B5","C5","D5","E5","F5","G5"].forEach((cell) => {
    ws[cell].s = { font: { bold: true, color: { rgb: blanco } }, fill: { fgColor: { rgb: azul } }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin", color: { rgb: "D9D9D9" } }, bottom: { style: "thin", color: { rgb: "D9D9D9" } }, left: { style: "thin", color: { rgb: "D9D9D9" } }, right: { style: "thin", color: { rgb: "D9D9D9" } } } };
  });

  for (let i = 6; i <= data.length; i++) {
    const colorFila = i % 2 === 0 ? gris : "FFFFFF";
    ["A","B","C","D","E","F","G"].forEach((col) => {
      const celda = col + i;
      if (ws[celda]) {
        ws[celda].s = { fill: { fgColor: { rgb: colorFila } }, border: { top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } }, left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } } }, alignment: { vertical: "center", horizontal: col === "A" || col === "E" || col === "F" || col === "G" ? "center" : "left" } };
      }
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, "Reporte Matrículas");
  XLSX.writeFile(wb, "Reporte_Matriculas_2026.xlsx");
  showSuccessAlert("Excel exportado correctamente.");
}

cargarReporte();