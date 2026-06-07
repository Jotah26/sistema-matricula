// feedback.js — stack de notificaciones toast y validación de campos en formularios
/* ── NOTIFICATION STACK ── */
(function() {
  var stack = document.getElementById('notifStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'notifStack';
    stack.className = 'notif-stack';
    document.body.appendChild(stack);
  }

  var ICONS = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    loading: ''
  };

  window.showNotification = function(tipo, titulo, descripcion, duracion) {
    tipo = tipo || 'warning';
    var icono = ICONS[tipo] || 'i';
    var loading = tipo === 'loading';

    var div = document.createElement('div');
    div.className = 'notif notif-' + tipo;

    var iconHtml = loading
      ? '<div class="spinner"></div>'
      : '<div class="icon-box icon-' + tipo + '">' + icono + '</div>';

    div.innerHTML = iconHtml +
      '<div>' +
        (titulo ? '<p class="notif-title">' + titulo + '</p>' : '') +
        (descripcion ? '<p class="notif-desc">' + descripcion + '</p>' : '') +
      '</div>';

    stack.appendChild(div);

    if (!loading && duracion !== 0) {
      var ms = duracion || (tipo === 'error' ? 8000 : tipo === 'warning' ? 5000 : 3000);
      if (ms > 0) {
        setTimeout(function() {
          div.classList.add('removing');
          setTimeout(function() { if (div.parentNode) div.parentNode.removeChild(div); }, 300);
        }, ms);
      }
    }

    return div;
  };

  window.removeNotification = function(div) {
    if (!div) return;
    div.classList.add('removing');
    setTimeout(function() { if (div.parentNode) div.parentNode.removeChild(div); }, 300);
  };
})();

/* ── FIELD VALIDATION ── */
window.validateField = function(input, estado, mensaje) {
  // 1. Find or create field container
  var field = input;
  while (field && field.classList && !field.classList.contains('field') && !field.hasAttribute('data-fv')) {
    field = field.parentNode;
  }
  if (!field || !field.classList || (!field.classList.contains('field') && !field.hasAttribute('data-fv'))) {
    field = input.parentNode;
    if (field.classList.contains('input-group')) {
      field.setAttribute('data-fv', '');
    } else {
      field.classList.add('field');
    }
  }

  if (!field) return;

  // 2. Remove old state
  field.classList.remove('field-success', 'field-error', 'field-warning');

  // 3. Check if we're inside an input-group
  var insideGroup = !!(input.closest('.input-group'));

  // 4. Create or reuse input-wrap (only for standalone fields)
  var inputWrap;
  if (!insideGroup) {
    inputWrap = field.querySelector('.input-wrap');
    if (!inputWrap) {
      inputWrap = document.createElement('div');
      inputWrap.className = 'input-wrap';
      if (input.nextSibling) {
        field.insertBefore(inputWrap, input.nextSibling);
      } else {
        field.appendChild(inputWrap);
      }
      var icon = document.createElement('span');
      icon.className = 'input-icon';
      inputWrap.appendChild(icon);
      inputWrap.insertBefore(input, icon);
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.boxShadow = 'none';
      input.style.background = 'transparent';
    }
  }

  // 5. Create or reuse hint
  var hint;
  if (insideGroup) {
    hint = field.nextElementSibling;
    if (!hint || !hint.classList.contains('field-hint')) {
      hint = document.createElement('span');
      hint.className = 'field-hint';
      field.parentNode.insertBefore(hint, field.nextSibling);
    }
  } else {
    hint = field.querySelector('.field-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-hint';
      field.appendChild(hint);
    }
  }

  // 6. Clear state
  if (!estado || estado === 'none') {
    hint.textContent = '';
    hint.className = 'field-hint';
    input.classList.remove('is-valid', 'is-invalid');
    if (inputWrap) {
      var icon = inputWrap.querySelector('.input-icon');
      if (icon) icon.textContent = '';
      inputWrap.style.borderColor = '#ccc';
      inputWrap.style.background = '#fff';
    }
    return;
  }

  // 7. Apply state
  field.classList.add('field-' + estado);
  hint.className = 'field-hint field-hint-' + estado;

  if (estado === 'success') {
    hint.textContent = '✓ ' + (mensaje || 'Correcto');
    if (insideGroup) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid', 'is-invalid');
      inputWrap.style.background = '#fff';
      var icon = inputWrap.querySelector('.input-icon');
      if (icon) icon.textContent = '✓';
      inputWrap.style.borderColor = '#4caf7d';
    }
  } else if (estado === 'error') {
    hint.textContent = '✕ ' + (mensaje || 'Campo inválido');
    if (insideGroup) {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-valid', 'is-invalid');
      inputWrap.style.background = '#fff5f5';
      var icon = inputWrap.querySelector('.input-icon');
      if (icon) icon.textContent = '✕';
      inputWrap.style.borderColor = '#e57373';
    }
  } else if (estado === 'warning') {
    hint.textContent = '⚠ ' + (mensaje || 'Revisa este campo');
    if (insideGroup) {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-valid', 'is-invalid');
      inputWrap.style.background = '#fff';
      var icon = inputWrap.querySelector('.input-icon');
      if (icon) icon.textContent = '⚠';
      inputWrap.style.borderColor = '#f5c542';
    }
  }
};

window.clearField = function(input) {
  var p = input;
  while (p && p.classList && !p.classList.contains('field') && !p.hasAttribute('data-fv')) {
    p = p.parentNode;
  }
  if (p && p.classList && (p.classList.contains('field') || p.hasAttribute('data-fv'))) {
    validateField(input, 'none');
  }
};

window.validateFormField = function(input, tests) {
  var val = input.value.trim();
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    if (t.test && !t.test(val)) {
      validateField(input, 'error', t.msg);
      return false;
    }
  }
  validateField(input, 'success', t && t.okMsg || 'Correcto');
  return true;
};

/* ── FORM PROGRESS ── */
window.initFormProgress = function(total) {
  var section = document.getElementById('progressSection');
  if (!section) return;
  section.classList.remove('hidden', 'd-none');
  updateFormProgress(0, total);
};

window.updateFormProgress = function(completados, total) {
  var pct = total > 0 ? Math.round((completados / total) * 100) : 0;
  var fill = document.getElementById('progressFill');
  var caption = document.getElementById('progressCaption');
  if (fill) fill.style.width = pct + '%';
  if (caption) caption.textContent = completados + ' de ' + total + ' campos completados';
};
