// ui.js — modales de alerta (showAlertModal, showErrorAlert, showSuccessAlert)
let _alertModal = null;

function getAlertModal() {
  if (_alertModal) return _alertModal;
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="modal fade" tabindex="-1" id="__alertModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow" style="border-radius:14px">
          <div class="modal-body text-center p-4">
            <div id="__alertIcon" class="mb-3" style="font-size:2.5rem"></div>
            <h6 class="fw-bold mb-2" id="__alertTitle"></h6>
            <p class="text-muted small mb-3" id="__alertMsg"></p>
            <button class="btn btn-sm fw-semibold px-4" style="background:#0a1628;color:#fff;border-radius:8px" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
  _alertModal = new bootstrap.Modal(document.getElementById("__alertModal"));
  return _alertModal;
}

function showAlertModal(title, msg, icon = "bi-info-circle", color = "#0a1628") {
  const modal = getAlertModal();
  document.getElementById("__alertIcon").innerHTML = `<i class="bi ${icon}" style="color:${color}"></i>`;
  document.getElementById("__alertTitle").textContent = title;
  document.getElementById("__alertMsg").innerHTML = msg;
  modal.show();
}

function showErrorAlert(msg) {
  if (typeof showNotification === "function") {
    showNotification("error", "Error", msg);
  } else {
    showAlertModal("Error", msg, "bi-exclamation-circle-fill", "#dc3545");
  }
}

function showSuccessAlert(msg) {
  if (typeof showNotification === "function") {
    showNotification("success", "Éxito", msg);
  } else {
    showAlertModal("Éxito", msg, "bi-check-circle-fill", "#198754");
  }
}
