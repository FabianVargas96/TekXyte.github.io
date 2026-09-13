/**
 * TekXyte — app.js
 * Módulos: Navbar · Estadísticas animadas · Diagrama de red · 
 *          Selector de formularios · Generación de documentos · 
 *          Vista previa · Envío de contacto
 */

/* ═══════════════════════════════════════════════
   VISIBILIDAD DE LA TIENDA PÚBLICA
   ═══════════════════════════════════════════════ */
(function initPublicStoreVisibility() {
  const storeEnabled = localStorage.getItem('tekxyte_public_store_enabled') !== 'false';
  document.querySelectorAll('.materials-banner, .materials-shop').forEach(element => {
    element.hidden = !storeEnabled;
  });
})();

/* ═══════════════════════════════════════════════
   1. NAVBAR — Scroll y menú móvil
   ═══════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Agrega clase 'scrolled' al hacer scroll para fondo más opaco
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Toggle menú móvil
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Cerrar menú al hacer click en enlace (mobile)
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();

/* ═══════════════════════════════════════════════
   2. CONTADORES ANIMADOS — Stats en el hero
   ═══════════════════════════════════════════════ */
(function initCounters() {
  /**
   * Anima un número desde 0 hasta su valor objetivo.
   * @param {HTMLElement} el    - El elemento que contiene el número
   * @param {number}      target - Valor final
   * @param {number}      duration - Duración en ms
   */
  function animateCounter(el, target, duration = 1800) {
    let start = null;
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Observador de intersección: dispara cuando el hero es visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => {
          animateCounter(el, parseInt(el.dataset.target));
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);
})();

/* ═══════════════════════════════════════════════
   3. DIAGRAMA DE RED — SVG animado en el hero
   ═══════════════════════════════════════════════ */
(function initNetworkDiagram() {
  const container = document.getElementById('networkDiagram');
  if (!container) return;

  /* Nodos de la red: cámaras, NVR, switch, servidor */
  const nodes = [
    { id: 'cam1',   label: '📷 Cámara IP',  x: 15, y: 15,  color: '#49B1E2' },
    { id: 'cam2',   label: '📷 Cámara IP',  x: 75, y: 12,  color: '#49B1E2' },
    { id: 'cam3',   label: '📷 Cámara IP',  x: 85, y: 55,  color: '#49B1E2' },
    { id: 'cam4',   label: '📷 Cámara IP',  x: 10, y: 70,  color: '#49B1E2' },
    { id: 'sw',     label: '🔀 Switch PoE', x: 50, y: 50,  color: '#73C6CF', size: 14 },
    { id: 'nvr',    label: '💾 NVR',        x: 30, y: 80,  color: '#39B4A0' },
    { id: 'router', label: '🌐 Router',     x: 65, y: 80,  color: '#2A377E' },
    { id: 'pc',     label: '🖥 PC Monitor', x: 50, y: 15,  color: '#DCEFF3', textColor: '#333' },
  ];

  /* Conexiones entre nodos */
  const edges = [
    ['cam1','sw'], ['cam2','sw'], ['cam3','sw'], ['cam4','sw'],
    ['sw','nvr'], ['sw','router'], ['sw','pc']
  ];

  /* Construye el SVG */
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.filter = 'drop-shadow(0 0 20px rgba(73,177,226,0.2))';

  // Dibuja líneas (edges) primero para que queden debajo
  edges.forEach(([from, to]) => {
    const a = nodes.find(n => n.id === from);
    const b = nodes.find(n => n.id === to);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', 'rgba(115,198,207,0.25)');
    line.setAttribute('stroke-width', '0.5');
    line.setAttribute('stroke-dasharray', '2 1');
    svg.appendChild(line);

    // Partícula animada en la línea
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '0.7');
    circle.setAttribute('fill', '#73C6CF');

    const animX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animX.setAttribute('attributeName', 'cx');
    animX.setAttribute('values', `${a.x};${b.x};${a.x}`);
    animX.setAttribute('dur', `${2 + Math.random() * 2}s`);
    animX.setAttribute('repeatCount', 'indefinite');

    const animY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animY.setAttribute('attributeName', 'cy');
    animY.setAttribute('values', `${a.y};${b.y};${a.y}`);
    animY.setAttribute('dur', `${2 + Math.random() * 2}s`);
    animY.setAttribute('repeatCount', 'indefinite');

    circle.appendChild(animX);
    circle.appendChild(animY);
    svg.appendChild(circle);
  });

  // Dibuja nodos
  nodes.forEach(node => {
    const size = node.size || 10;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bg.setAttribute('cx', node.x); bg.setAttribute('cy', node.y);
    bg.setAttribute('r', size / 2);
    bg.setAttribute('fill', node.color);
    bg.setAttribute('fill-opacity', '0.15');
    bg.setAttribute('stroke', node.color);
    bg.setAttribute('stroke-width', '0.5');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x); text.setAttribute('y', node.y + 1);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', node.textColor || node.color);
    text.setAttribute('font-size', '3');
    text.textContent = node.label.split(' ')[0]; // Sólo el emoji

    g.appendChild(bg);
    g.appendChild(text);

    // Pulso de halo en el switch (nodo central)
    if (node.id === 'sw') {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', node.x); halo.setAttribute('cy', node.y);
      halo.setAttribute('r', 7); halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', '#73C6CF'); halo.setAttribute('stroke-width', '0.3');
      const animR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animR.setAttribute('attributeName', 'r'); animR.setAttribute('values', '7;14;7');
      animR.setAttribute('dur', '3s'); animR.setAttribute('repeatCount', 'indefinite');
      const animO = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animO.setAttribute('attributeName', 'stroke-opacity'); animO.setAttribute('values', '0.6;0;0.6');
      animO.setAttribute('dur', '3s'); animO.setAttribute('repeatCount', 'indefinite');
      halo.appendChild(animR); halo.appendChild(animO);
      svg.appendChild(halo);
    }

    svg.appendChild(g);
  });

  container.appendChild(svg);
})();

/* ═══════════════════════════════════════════════
   4. SELECTOR DE FORMULARIOS DE DOCUMENTOS
   ═══════════════════════════════════════════════ */
(function initDocForms() {
  const buttons = document.querySelectorAll('.doc-type-btn');
  const forms   = document.querySelectorAll('.doc-form');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Desactivar todos
      buttons.forEach(b => b.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));

      // Activar el seleccionado
      btn.classList.add('active');
      const target = document.getElementById('form-' + btn.dataset.form);
      target?.classList.add('active');
    });
  });
})();

/* ═══════════════════════════════════════════════
   5. LIMPIAR FORMULARIO
   ═══════════════════════════════════════════════ */
/**
 * Limpia todos los campos del formulario activo.
 * @param {string} formId - ID del formulario (ej: 'hoja-vida')
 */
function clearForm(formId) {
  const form = document.getElementById('form-' + formId);
  if (!form) return;
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.value = '';
  });
}

/* ═══════════════════════════════════════════════
   6. VISTA PREVIA DEL DOCUMENTO
   ═══════════════════════════════════════════════ */
/**
 * Abre el modal con una vista previa HTML del documento.
 * @param {string} type - Tipo de documento ('hoja-vida', 'orden-servicio', etc.)
 */
function previewDoc(type) {
  const modal  = document.getElementById('docModal');
  const body   = document.getElementById('modalBody');
  const title  = document.getElementById('modalTitle');
  const today  = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  let html = '';

  if (type === 'hoja-vida') {
    const nombre   = val('eq-nombre')    || '—';
    const tipoEq   = val('eq-tipo')      || '—';
    const marca    = val('eq-marca')     || '—';
    const modelo   = val('eq-modelo')    || '—';
    const serie    = val('eq-serie')     || '—';
    const ip       = val('eq-ip')        || '—';
    const mac      = val('eq-mac')       || '—';
    const ubicacion= val('eq-ubicacion') || '—';
    const fechaInst= val('eq-fecha-inst')|| '—';
    const fechaGar = val('eq-fecha-gar') || '—';
    const cliente  = val('eq-cliente')   || '—';
    const tecnico  = val('eq-tecnico')   || '—';
    const specs    = val('eq-specs')     || '—';
    const obs      = val('eq-obs')       || '—';

    title.textContent = 'Hoja de Vida — ' + nombre;
    html = `
      <div class="doc-preview">
        <div class="doc-header">
          <div class="doc-logo">Tek<span>Xyte</span>•</div>
          <div>
            <div class="doc-title">HOJA DE VIDA DE EQUIPO</div>
            <div class="doc-num">Generado: ${today}</div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Identificación del Equipo</div>
          <div class="doc-row">
            <div class="doc-field"><label>Nombre</label><span>${nombre}</span></div>
            <div class="doc-field"><label>Tipo</label><span>${tipoEq}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Marca</label><span>${marca}</span></div>
            <div class="doc-field"><label>Modelo</label><span>${modelo}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>N° de Serie</label><span>${serie}</span></div>
            <div class="doc-field"><label>Ubicación</label><span>${ubicacion}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Red e Identificación</div>
          <div class="doc-row">
            <div class="doc-field"><label>Dirección IP</label><span>${ip}</span></div>
            <div class="doc-field"><label>MAC Address</label><span>${mac}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Fechas y Responsables</div>
          <div class="doc-row">
            <div class="doc-field"><label>Fecha Instalación</label><span>${fechaInst}</span></div>
            <div class="doc-field"><label>Fecha Garantía</label><span>${fechaGar}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Cliente</label><span>${cliente}</span></div>
            <div class="doc-field"><label>Técnico</label><span>${tecnico}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Especificaciones Técnicas</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${specs}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Observaciones</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${obs}</p>
        </div>
        <div class="doc-section" style="margin-top:40px;">
          <div class="doc-row">
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Firma Cliente</label><span>&nbsp;</span>
            </div>
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Firma Técnico TekXyte</label><span>&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="doc-footer">
          <span>TekXyte — Soluciones Tecnológicas</span>
          <span>info@tekxyte.com · www.tekxyte.com</span>
        </div>
      </div>`;

  } else if (type === 'orden-servicio') {
    const numero   = val('os-numero')     || 'OS-' + Date.now();
    const tipoOS   = val('os-tipo')       || '—';
    const cliente  = val('os-cliente')    || '—';
    const dir      = val('os-direccion')  || '—';
    const fecha    = val('os-fecha')      || '—';
    const tecnico  = val('os-tecnico')    || '—';
    const prior    = val('os-prioridad')  || '—';
    const estado   = val('os-estado')     || '—';
    const desc     = val('os-descripcion')|| '—';
    const mats     = val('os-materiales') || '—';

    title.textContent = 'Orden de Servicio ' + numero;
    html = `
      <div class="doc-preview">
        <div class="doc-header">
          <div class="doc-logo">Tek<span>Xyte</span>•</div>
          <div>
            <div class="doc-title">ORDEN DE SERVICIO</div>
            <div class="doc-num">${numero} — ${today}</div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Datos del Servicio</div>
          <div class="doc-row">
            <div class="doc-field"><label>Tipo de Servicio</label><span>${tipoOS}</span></div>
            <div class="doc-field"><label>Prioridad</label><span>${prior}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Cliente</label><span>${cliente}</span></div>
            <div class="doc-field"><label>Estado</label><span>${estado}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Dirección</label><span>${dir}</span></div>
            <div class="doc-field"><label>Fecha Programada</label><span>${fecha}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Técnico Asignado</label><span>${tecnico}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Descripción del Servicio</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${desc}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Materiales / Equipos</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${mats}</p>
        </div>
        <div class="doc-section" style="margin-top:40px;">
          <div class="doc-row">
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Autoriza Cliente</label><span>&nbsp;</span>
            </div>
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Técnico TekXyte</label><span>&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="doc-footer">
          <span>TekXyte — Soluciones Tecnológicas</span>
          <span>info@tekxyte.com · www.tekxyte.com</span>
        </div>
      </div>`;

  } else if (type === 'acta-entrega') {
    const numero   = val('ae-numero')    || 'AE-' + Date.now();
    const fecha    = val('ae-fecha')     || today;
    const cliente  = val('ae-cliente')   || '—';
    const contacto = val('ae-contacto')  || '—';
    const tecnico  = val('ae-tecnico')   || '—';
    const proyecto = val('ae-proyecto')  || '—';
    const trabajos = val('ae-trabajos')  || '—';
    const equipos  = val('ae-equipos')   || '—';
    const obs      = val('ae-obs')       || '—';

    title.textContent = 'Acta de Entrega ' + numero;
    html = `
      <div class="doc-preview">
        <div class="doc-header">
          <div class="doc-logo">Tek<span>Xyte</span>•</div>
          <div>
            <div class="doc-title">ACTA DE ENTREGA</div>
            <div class="doc-num">${numero} — ${fecha}</div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Información General</div>
          <div class="doc-row">
            <div class="doc-field"><label>Cliente</label><span>${cliente}</span></div>
            <div class="doc-field"><label>Contacto</label><span>${contacto}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Proyecto</label><span>${proyecto}</span></div>
            <div class="doc-field"><label>Técnico TekXyte</label><span>${tecnico}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Trabajos Realizados</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${trabajos}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Equipos Entregados</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${equipos}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Observaciones / Pendientes</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${obs}</p>
        </div>
        <p style="font-size:11px;color:#555;margin-top:16px;background:#f9f9f9;padding:10px;border-left:3px solid #2A377E;">
          Con la firma de este documento, el cliente declara haber recibido los trabajos y equipos descritos a plena satisfacción.
        </p>
        <div class="doc-section" style="margin-top:32px;">
          <div class="doc-row">
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Firma y Sello del Cliente</label><span>&nbsp;</span>
            </div>
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Firma Técnico TekXyte</label><span>&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="doc-footer">
          <span>TekXyte — Soluciones Tecnológicas</span>
          <span>info@tekxyte.com · www.tekxyte.com</span>
        </div>
      </div>`;

  } else if (type === 'reporte-visita') {
    const numero     = val('rv-numero')          || 'RV-' + Date.now();
    const fecha      = val('rv-fecha')           || today;
    const cliente    = val('rv-cliente')         || '—';
    const tecnico    = val('rv-tecnico')         || '—';
    const horaIni    = val('rv-hora-ini')        || '—';
    const horaFin    = val('rv-hora-fin')        || '—';
    const activs     = val('rv-actividades')     || '—';
    const hallazgos  = val('rv-hallazgos')       || '—';
    const recomend   = val('rv-recomendaciones') || '—';

    title.textContent = 'Reporte de Visita ' + numero;
    html = `
      <div class="doc-preview">
        <div class="doc-header">
          <div class="doc-logo">Tek<span>Xyte</span>•</div>
          <div>
            <div class="doc-title">REPORTE DE VISITA TÉCNICA</div>
            <div class="doc-num">${numero}</div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Datos de la Visita</div>
          <div class="doc-row">
            <div class="doc-field"><label>Cliente</label><span>${cliente}</span></div>
            <div class="doc-field"><label>Técnico</label><span>${tecnico}</span></div>
          </div>
          <div class="doc-row">
            <div class="doc-field"><label>Fecha</label><span>${fecha}</span></div>
            <div class="doc-field"><label>Horario</label><span>${horaIni} — ${horaFin}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Actividades Realizadas</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${activs}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Hallazgos y Diagnóstico</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${hallazgos}</p>
        </div>
        <div class="doc-section">
          <div class="doc-section-title">Recomendaciones</div>
          <p style="font-size:12px;color:#444;margin-top:6px;">${recomend}</p>
        </div>
        <div class="doc-section" style="margin-top:32px;">
          <div class="doc-row">
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Vo.Bo. Cliente</label><span>&nbsp;</span>
            </div>
            <div class="doc-field" style="border-top:1px solid #ccc;padding-top:8px;">
              <label>Técnico TekXyte</label><span>&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="doc-footer">
          <span>TekXyte — Soluciones Tecnológicas</span>
          <span>info@tekxyte.com · www.tekxyte.com</span>
        </div>
      </div>`;
  }

  body.innerHTML = html;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de vista previa.
 */
function closeModal() {
  document.getElementById('docModal').classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Activa el diálogo de impresión del navegador para generar PDF.
 */
function printDoc() {
  window.print();
}

/**
 * Helper: obtiene el valor de un campo de formulario por su id.
 * @param {string} id - ID del elemento
 * @returns {string}
 */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ═══════════════════════════════════════════════
   7. GENERACIÓN DE DOCUMENTO (llamada a API)
   ═══════════════════════════════════════════════ */
/**
 * Simula guardar y generar el documento vía API backend.
 * En producción, envía los datos al endpoint /api/documents/generate
 * @param {string} type - Tipo de documento
 */
function generateDoc(type) {
  // Mostrar vista previa primero
  previewDoc(type);

  // Notificar al usuario
  showToast('📄 Usa "Imprimir / PDF" en la vista previa para descargar', 'info');
}

/**
 * Guarda el registro del documento en la base de datos vía API REST.
 * @param {string} type - Tipo de documento
 */
async function saveRecord(type) {
  const token = localStorage.getItem('tekxyte_token');

  // Construir payload según el tipo de formulario
  const payload = { type, data: collectFormData(type) };

  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('✅ Documento guardado correctamente', 'success');
    } else {
      const err = await res.json();
      showToast('⚠️ ' + (err.message || 'Error al guardar'), 'error');
    }
  } catch {
    // En demo sin backend, mostrar mensaje informativo
    showToast('💾 (Demo) Datos listos para guardar en BD', 'info');
  }
}

/**
 * Recopila todos los campos de un formulario en un objeto plano.
 * @param {string} type - ID del formulario
 * @returns {Object}
 */
function collectFormData(type) {
  const form   = document.getElementById('form-' + type);
  const result = {};
  form?.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.id) result[el.id] = el.value;
  });
  return result;
}

/* ═══════════════════════════════════════════════
   8. FORMULARIO DE CONTACTO
   ═══════════════════════════════════════════════ */
/**
 * Maneja el envío del formulario de contacto.
 * Envía datos al endpoint /api/contact vía POST.
 * @param {Event} e - Evento submit
 */
async function submitContact(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = form.querySelector('button[type="submit"]');

  const formData = new FormData(form);
  const payload  = Object.fromEntries(formData.entries());

  btn.disabled   = true;
  btn.textContent = 'Enviando...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 201) {
      success.style.display = 'block';
      form.reset();
    } else {
      showToast('Error al enviar. Inténtalo de nuevo.', 'error');
    }
  } catch {
    // Demo: mostrar éxito de todas formas
    success.style.display = 'block';
    form.reset();
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Enviar solicitud →';
  }
}

/* ═══════════════════════════════════════════════
   9. SISTEMA DE NOTIFICACIONES (TOAST)
   ═══════════════════════════════════════════════ */
/**
 * Muestra una notificación flotante (toast) al usuario.
 * @param {string} message - Mensaje a mostrar
 * @param {'success'|'error'|'info'} type - Tipo de notificación
 * @param {number} duration - Duración en ms (default: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
  // Crear o reutilizar contenedor de toasts
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      z-index: 99999; display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    success: { bg: 'rgba(57,180,160,0.9)', border: '#39B4A0' },
    error:   { bg: 'rgba(220,53,69,0.9)',  border: '#dc3545' },
    info:    { bg: 'rgba(73,177,226,0.9)', border: '#49B1E2' }
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 14px 20px;
    background: ${colors[type].bg};
    border: 1px solid ${colors[type].border};
    border-radius: 12px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    max-width: 360px;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0,0,0.2,1);
  `;
  toast.textContent = message;
  container.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  // Remover después del tiempo indicado
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ═══════════════════════════════════════════════
   10. ANIMACIONES DE SCROLL (Intersection Observer)
   ═══════════════════════════════════════════════ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.service-card, .value-item, .about-card, .mat-item, .contact-item'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // Inicializa con estado invisible
  targets.forEach((el, i) => {
    el.style.cssText += `
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s;
    `;
    observer.observe(el);
  });
})();

/* ═══════════════════════════════════════════════
   11. CERRAR MODAL CON ESC o CLICK FUERA
   ═══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
document.getElementById('docModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ═══════════════════════════════════════════════
   12. CARRUSEL LIGERO Y SELECTOR DE MATERIALES
   ═══════════════════════════════════════════════ */
(function initMaterialsCarousel() {
  const shop = document.querySelector('.materials-shop');
  if (!shop) return;

  const data = {
    componentes: [
      { title: 'Switch PoE 8 puertos', price: '$220.000', img: 'https://via.placeholder.com/320x180?text=Switch+PoE' },
      { title: 'Cable UTP Cat6 305m', price: '$120.000', img: 'https://via.placeholder.com/320x180?text=Cable+Cat6' },
      { title: 'NVR 8CH', price: '$750.000', img: 'https://via.placeholder.com/320x180?text=NVR+8CH' }
    ],
    perifericos: [
      { title: 'Teclado mecánico', price: '$85.000', img: 'https://via.placeholder.com/320x180?text=Teclado' },
      { title: 'Mouse óptico', price: '$35.000', img: 'https://via.placeholder.com/320x180?text=Mouse' },
      { title: 'Base de teclado', price: '$18.000', img: 'https://via.placeholder.com/320x180?text=Base' }
    ],
    pantallas: [
      { title: 'Monitor 24" IPS', price: '$420.000', img: 'https://via.placeholder.com/320x180?text=Monitor+24' },
      { title: 'Monitor 27" 4K', price: '$1.250.000', img: 'https://via.placeholder.com/320x180?text=Monitor+27' }
    ]
  };

  const categories = shop.querySelectorAll('.mat-cat');
  const track = document.getElementById('carouselTrack');
  const btnPrev = shop.querySelector('.carousel-nav.prev');
  const btnNext = shop.querySelector('.carousel-nav.next');

  function render(cat) {
    const items = data[cat] || [];
    track.innerHTML = items.map(it => {
      return `
        <div class="slide" tabindex="0">
          <img src="${it.img}" alt="${it.title}" />
          <div class="p-title">${it.title}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="p-price">${it.price}</div>
            <button class="btn-secondary add-cart">Agregar</button>
          </div>
        </div>`;
    }).join('');

    // Añadir productos desde localStorage (Tienda)
    try {
      const stored = JSON.parse(localStorage.getItem('tekxyte_products') || '[]');
      const filtered = stored.filter(p => !p.category || p.category === cat || cat === 'componentes');
      const prodSlides = filtered.map(p => {
        const img = p.image || 'https://via.placeholder.com/320x180?text=Producto';
        const price = p.price ? ('$' + (p.price.toLocaleString ? p.price.toLocaleString() : p.price)) : '—';
        return `
          <div class="slide" tabindex="0">
            <img src="${img}" alt="${p.name}" />
            <div class="p-title">${p.name}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div class="p-price">${price}</div>
              <button class="btn-secondary add-cart">Agregar</button>
            </div>
          </div>`;
      }).join('');
      track.innerHTML += prodSlides;
    } catch (e) { /* ignore parse errors */ }

    // Añadir listeners a botones "Agregar"
    track.querySelectorAll('.add-cart').forEach((b, i) => {
      b.addEventListener('click', () => showToast('✅ Añadido: ' + (data[cat][i].title || 'producto'), 'success'));
    });
  }

  // navegación
  btnPrev?.addEventListener('click', () => {
    track.scrollBy({ left: -300, behavior: 'smooth' });
  });
  btnNext?.addEventListener('click', () => {
    track.scrollBy({ left: 300, behavior: 'smooth' });
  });

  // categorías
  categories.forEach(btn => {
    btn.addEventListener('click', () => {
      categories.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.cat);
      track.scrollLeft = 0;
    });
  });

  // Render inicial
  const initial = shop.querySelector('.mat-cat.active')?.dataset.cat || 'componentes';
  render(initial);
})();
