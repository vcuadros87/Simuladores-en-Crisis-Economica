'use strict';

/* ── NAVEGACIÓN DE ESCENARIOS ── */
function activarEscenario(letra) {
  document.querySelectorAll('.form-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.esc-btn').forEach(function(b) { b.classList.remove('active'); });
  var panel  = document.getElementById('form-' + letra);
  var boton  = document.querySelector('[data-escenario="' + letra + '"]');
  if (panel) panel.classList.add('active');
  if (boton) boton.classList.add('active');
  limpiarResultados();
}

/* ── VALIDACIÓN Y FORMATEO ── */
function esNumeroPositivo(v)      { return v !== '' && !isNaN(v) && Number(v) >= 0; }
function esNumeroMayorQueCero(v)  { return v !== '' && !isNaN(v) && Number(v) > 0; }
function formatearNumero(n, dec)  { if (dec === undefined) dec = 2; return Number(n).toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

function obtenerMetadatosEstado(estado) {
  return ({ normal: { icono: '✓', texto: 'Situación Normal' }, advertencia: { icono: '⚠', texto: 'Advertencia' }, critico: { icono: '✕', texto: 'Nivel Crítico' } })[estado] || { icono: '✓', texto: 'Normal' };
}

/* ── CONSTRUCCIÓN DOM ── */
function mostrarErrorValidacion(msg) {
  var c = document.getElementById('resultados-container');
  c.innerHTML = '';
  var b = document.createElement('div');
  b.className = 'alerta-banner critico';
  b.innerHTML = '<span class="alerta-icono">⚠</span><span>' + msg + '</span>';
  c.appendChild(b);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function crearBannerEstado(estado, extra) {
  var m = obtenerMetadatosEstado(estado);
  var b = document.createElement('div');
  b.className = 'alerta-banner ' + estado;
  b.innerHTML = '<span class="alerta-icono">' + m.icono + '</span><span><strong>' + m.texto + '</strong>' + (extra ? ' — ' + extra : '') + '</span>';
  return b;
}

function crearTarjeta(label, valor, estado, grande) {
  var t = document.createElement('div');
  t.className = 'resultado-card' + (estado ? ' estado-' + estado : '');
  var l = document.createElement('div'); l.className = 'card-label'; l.textContent = label;
  var v = document.createElement('div'); v.className = 'card-valor' + (grande ? ' valor-grande' : ''); v.textContent = valor;
  t.appendChild(l); t.appendChild(v);
  return t;
}

function iniciarResultados(titulo) {
  var c = document.getElementById('resultados-container');
  c.innerHTML = '';
  var t = document.createElement('p'); t.className = 'resultado-titulo'; t.textContent = titulo;
  c.appendChild(t);
  return c;
}

/* ── ESCENARIO B — PRECIOS ── */
function agregarProducto() {
  var c = document.getElementById('b-productos-container');
  var f = document.createElement('div'); f.className = 'producto-row';
  f.innerHTML =
    '<div class="field-group"><label>Producto</label><input type="text" class="b-producto" placeholder="ej. Pan" /></div>' +
    '<div class="field-group"><label>Precio anterior (Bs)</label><input type="number" class="b-precio-anterior" placeholder="ej. 5" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Precio actual (Bs)</label><input type="number" class="b-precio-actual" placeholder="ej. 8" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Cantidad mensual</label><input type="number" class="b-cantidad" placeholder="ej. 6" min="0" /></div>';
  c.appendChild(f);
}

function calcularEscenarioB() {
  var nombres   = document.querySelectorAll('#form-B .b-producto');
  var precios_a = document.querySelectorAll('#form-B .b-precio-anterior');
  var precios_b = document.querySelectorAll('#form-B .b-precio-actual');
  var cantidades= document.querySelectorAll('#form-B .b-cantidad');

  if (!nombres.length) { mostrarErrorValidacion('Agrega al menos un producto.'); return; }

  var filas = [], totAnt = 0, totAct = 0;

  for (var i = 0; i < nombres.length; i++) {
    var nom = nombres[i].value.trim();
    var pa  = Number(precios_a[i].value);
    var pac = Number(precios_b[i].value);
    var cnt = Number(cantidades[i].value);
    if (!nom)                                    { mostrarErrorValidacion('Nombre vacío en fila ' + (i+1) + '.'); return; }
    if (!esNumeroMayorQueCero(precios_a[i].value)) { mostrarErrorValidacion('Precio anterior de "' + nom + '" debe ser > 0.'); return; }
    if (!esNumeroMayorQueCero(precios_b[i].value)) { mostrarErrorValidacion('Precio actual de "' + nom + '" debe ser > 0.'); return; }
    if (!esNumeroMayorQueCero(cantidades[i].value)){ mostrarErrorValidacion('Cantidad de "' + nom + '" debe ser > 0.'); return; }
    var gA = pa * cnt, gB = pac * cnt;
    totAnt += gA; totAct += gB;
    filas.push({ nom, pa, pac, cnt, gA, gB, dif: gB-gA, pct: ((pac-pa)/pa)*100 });
  }

  var totDif = totAct - totAnt;
  var totPct = ((totAct - totAnt) / totAnt) * 100;
  var estado = totPct >= 30 ? 'critico' : totPct >= 15 ? 'advertencia' : 'normal';

  var c = iniciarResultados('▸ ESCENARIO 1 — Impacto del aumento de precios');
  c.appendChild(crearBannerEstado(estado, 'Aumento total: ' + formatearNumero(totPct, 1) + '%'));

  var g = document.createElement('div'); g.className = 'resultado-grid';
  g.appendChild(crearTarjeta('Gasto anterior total', formatearNumero(totAnt, 2) + ' Bs', '', true));
  g.appendChild(crearTarjeta('Gasto actual total', formatearNumero(totAct, 2) + ' Bs', estado, true));
  g.appendChild(crearTarjeta('Diferencia mensual', '+' + formatearNumero(totDif, 2) + ' Bs', 'critico', true));
  g.appendChild(crearTarjeta('% de aumento', formatearNumero(totPct, 1) + '%', estado, true));
  c.appendChild(g);

  var tw = document.createElement('div'); tw.className = 'resultado-tabla-wrapper';
  var tb = document.createElement('table'); tb.className = 'resultado-tabla';
  tb.innerHTML = '<thead><tr><th>Producto</th><th>P. ant.</th><th>P. act.</th><th>Cant.</th><th>Gasto ant.</th><th>Gasto act.</th><th>Diferencia</th><th>% Aumento</th></tr></thead>';
  var tbody = document.createElement('tbody');
  filas.forEach(function(f) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + f.nom + '</td><td>' + formatearNumero(f.pa,2) + ' Bs</td><td>' + formatearNumero(f.pac,2) + ' Bs</td><td>' + f.cnt + '</td><td>' + formatearNumero(f.gA,2) + ' Bs</td><td class="neutro">' + formatearNumero(f.gB,2) + ' Bs</td><td class="positivo">+' + formatearNumero(f.dif,2) + ' Bs</td><td class="positivo">+' + formatearNumero(f.pct,1) + '%</td>';
    tbody.appendChild(tr);
  });
  var tot = document.createElement('tr'); tot.style.fontWeight = '700';
  tot.innerHTML = '<td colspan="4">TOTAL</td><td>' + formatearNumero(totAnt,2) + ' Bs</td><td class="neutro">' + formatearNumero(totAct,2) + ' Bs</td><td class="positivo">+' + formatearNumero(totDif,2) + ' Bs</td><td class="positivo">+' + formatearNumero(totPct,1) + '%</td>';
  tbody.appendChild(tot);
  tb.appendChild(tbody); tw.appendChild(tb); c.appendChild(tw);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO D — PRESUPUESTO ── */
function agregarItem() {
  var c = document.getElementById('d-items-container');
  var f = document.createElement('div'); f.className = 'item-row';
  f.innerHTML =
    '<div class="field-group"><label>Producto</label><input type="text" class="d-item-nombre" placeholder="ej. Leche" /></div>' +
    '<div class="field-group"><label>Precio unitario (Bs)</label><input type="number" class="d-item-precio" placeholder="ej. 7" min="0" step="0.01" /></div>' +
    '<div class="field-group"><label>Cantidad</label><input type="number" class="d-item-cantidad" placeholder="ej. 4" min="0" /></div>';
  c.appendChild(f);
}

function calcularEscenarioD() {
  var pres = Number(document.getElementById('d-presupuesto').value);
  if (!esNumeroMayorQueCero(document.getElementById('d-presupuesto').value)) { mostrarErrorValidacion('El presupuesto debe ser mayor a cero.'); return; }

  var nombres   = document.querySelectorAll('#form-D .d-item-nombre');
  var precios   = document.querySelectorAll('#form-D .d-item-precio');
  var cantidades= document.querySelectorAll('#form-D .d-item-cantidad');
  if (!nombres.length) { mostrarErrorValidacion('Agrega al menos un producto.'); return; }

  var items = [], total = 0;
  for (var i = 0; i < nombres.length; i++) {
    var nom = nombres[i].value.trim();
    var pr  = Number(precios[i].value);
    var cnt = Number(cantidades[i].value);
    if (!nom)                                    { mostrarErrorValidacion('Nombre vacío en fila ' + (i+1) + '.'); return; }
    if (!esNumeroMayorQueCero(precios[i].value))   { mostrarErrorValidacion('Precio de "' + nom + '" debe ser > 0.'); return; }
    if (!esNumeroMayorQueCero(cantidades[i].value)){ mostrarErrorValidacion('Cantidad de "' + nom + '" debe ser > 0.'); return; }
    var sub = pr * cnt; total += sub;
    items.push({ nom, pr, cnt, sub });
  }

  var pct = (total / pres) * 100;
  var clasif = pct <= 60 ? 'Bajo (≤60%)' : pct <= 90 ? 'Medio (61–90%)' : pct <= 100 ? 'Alto (91–100%)' : 'Insuficiente (supera el presupuesto)';
  var alcanza = total <= pres;
  var saldo   = pres - total;
  var falta   = total - pres;
  var estado  = alcanza ? (pct >= 90 ? 'advertencia' : 'normal') : 'critico';

  var c = iniciarResultados('▸ ESCENARIO 2 — Presupuesto familiar de compras');
  c.appendChild(crearBannerEstado(estado, alcanza ? 'El presupuesto alcanza. Saldo: ' + formatearNumero(saldo,2) + ' Bs.' : '¡No alcanza! Faltan ' + formatearNumero(falta,2) + ' Bs.'));

  var g = document.createElement('div'); g.className = 'resultado-grid';
  g.appendChild(crearTarjeta('Presupuesto disponible', formatearNumero(pres,2) + ' Bs', 'normal', false));
  g.appendChild(crearTarjeta('Total de la compra', formatearNumero(total,2) + ' Bs', estado, true));
  g.appendChild(crearTarjeta(alcanza ? 'Saldo restante' : 'Monto faltante', formatearNumero(alcanza ? saldo : falta, 2) + ' Bs', alcanza ? 'normal' : 'critico', true));
  g.appendChild(crearTarjeta('Clasificación del gasto', clasif, estado, false));
  c.appendChild(g);

  var tw = document.createElement('div'); tw.className = 'resultado-tabla-wrapper';
  var tb = document.createElement('table'); tb.className = 'resultado-tabla';
  tb.innerHTML = '<thead><tr><th>Producto</th><th>Precio unit.</th><th>Cantidad</th><th>Subtotal</th></tr></thead>';
  var tbody = document.createElement('tbody');
  items.forEach(function(item) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + item.nom + '</td><td>' + formatearNumero(item.pr,2) + ' Bs</td><td>' + item.cnt + '</td><td class="neutro">' + formatearNumero(item.sub,2) + ' Bs</td>';
    tbody.appendChild(tr);
  });
  var tot = document.createElement('tr'); tot.style.fontWeight = '700';
  tot.innerHTML = '<td colspan="3">TOTAL</td><td class="' + (alcanza ? 'negativo' : 'positivo') + '">' + formatearNumero(total,2) + ' Bs</td>';
  tbody.appendChild(tot);
  tb.appendChild(tbody); tw.appendChild(tb); c.appendChild(tw);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ESCENARIO F — PODER ADQUISITIVO ── */
function calcularEscenarioF() {
  var ing  = Number(document.getElementById('f-ingreso').value);
  var gAnt = Number(document.getElementById('f-gasto-anterior').value);
  var gAct = Number(document.getElementById('f-gasto-actual').value);
  var pBAnt= Number(document.getElementById('f-precio-basico-anterior').value);
  var pBAct= Number(document.getElementById('f-precio-basico-actual').value);

  if (!esNumeroMayorQueCero(document.getElementById('f-ingreso').value))               { mostrarErrorValidacion('El ingreso debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-gasto-anterior').value))        { mostrarErrorValidacion('El gasto anterior debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-gasto-actual').value))          { mostrarErrorValidacion('El gasto actual debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-precio-basico-anterior').value)){ mostrarErrorValidacion('El precio de canasta anterior debe ser mayor a cero.'); return; }
  if (!esNumeroMayorQueCero(document.getElementById('f-precio-basico-actual').value))  { mostrarErrorValidacion('El precio de canasta actual debe ser mayor a cero.'); return; }

  var aumento  = gAct - gAnt;
  var saldoAnt = ing - gAnt;
  var saldoAct = ing - gAct;
  var perdPct  = ((gAct - gAnt) / ing) * 100;
  var canPct   = ((pBAct - pBAnt) / pBAnt) * 100;
  var canAnt   = ing / pBAnt;
  var canAct   = ing / pBAct;

  var nivel = saldoAct < 0 ? 'Crítico — el ingreso no cubre los gastos' :
              perdPct >= 20 ? 'Alto — se pierde más del 20% del ingreso' :
              perdPct >= 10 ? 'Medio — pérdida significativa' : 'Bajo — impacto moderado';
  var estado = saldoAct < 0 ? 'critico' : perdPct >= 10 ? 'advertencia' : 'normal';

  var c = iniciarResultados('▸ ESCENARIO 3 — Pérdida del poder adquisitivo');
  c.appendChild(crearBannerEstado(estado, nivel));

  var g = document.createElement('div'); g.className = 'resultado-grid';
  g.appendChild(crearTarjeta('Ingreso familiar', formatearNumero(ing,2) + ' Bs', '', false));
  g.appendChild(crearTarjeta('Aumento del gasto mensual', '+' + formatearNumero(aumento,2) + ' Bs', 'critico', false));
  g.appendChild(crearTarjeta('Saldo anterior', formatearNumero(saldoAnt,2) + ' Bs', 'normal', true));
  g.appendChild(crearTarjeta('Saldo actual', formatearNumero(saldoAct,2) + ' Bs', estado, true));
  g.appendChild(crearTarjeta('% pérdida poder adquisitivo', formatearNumero(perdPct,1) + '%', estado, true));
  g.appendChild(crearTarjeta('Aumento precio canasta básica', '+' + formatearNumero(canPct,1) + '%', 'advertencia', false));
  g.appendChild(crearTarjeta('Canastas que se compraban', formatearNumero(canAnt,1), 'normal', false));
  g.appendChild(crearTarjeta('Canastas que se compran ahora', formatearNumero(canAct,1), estado, false));
  g.appendChild(crearTarjeta('Canastas perdidas por inflación', '-' + formatearNumero(canAnt - canAct,1), 'critico', true));
  c.appendChild(g);
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── LIMPIEZA ── */
function limpiarFormulario(letra) {
  var panel = document.getElementById('form-' + letra);
  if (!panel) return;
  panel.querySelectorAll('input').forEach(function(i) { i.value = ''; });
  if (letra === 'B') {
    document.getElementById('b-productos-container').querySelectorAll('.producto-row').forEach(function(f, i) {
      i === 0 ? f.querySelectorAll('input').forEach(function(inp) { inp.value=''; }) : f.remove();
    });
  }
  if (letra === 'D') {
    document.getElementById('d-items-container').querySelectorAll('.item-row').forEach(function(f, i) {
      i === 0 ? f.querySelectorAll('input').forEach(function(inp) { inp.value=''; }) : f.remove();
    });
  }
  limpiarResultados();
}

function limpiarResultados() {
  document.getElementById('resultados-container').innerHTML =
    '<div class="resultado-placeholder"><span class="placeholder-icon">▶</span><p>Ingresa datos en el simulador y presiona <strong>Calcular</strong> para ver los resultados aquí.</p></div>';
}

/* ── CASOS DE ESTUDIO ── */
function cargarCasoB() {
  activarEscenario('B'); limpiarFormulario('B');
  var datos = [{ nom:'Arroz', a:8, b:11, c:10 }, { nom:'Papa', a:7, b:10, c:8 }, { nom:'Aceite', a:12, b:18, c:4 }];
  for (var i = 1; i < datos.length; i++) agregarProducto();
  var filas = document.getElementById('b-productos-container').querySelectorAll('.producto-row');
  datos.forEach(function(d, idx) {
    filas[idx].querySelector('.b-producto').value        = d.nom;
    filas[idx].querySelector('.b-precio-anterior').value = d.a;
    filas[idx].querySelector('.b-precio-actual').value   = d.b;
    filas[idx].querySelector('.b-cantidad').value        = d.c;
  });
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoD() {
  activarEscenario('D'); limpiarFormulario('D');
  document.getElementById('d-presupuesto').value = 500;
  var f = document.getElementById('d-items-container').querySelector('.item-row');
  f.querySelector('.d-item-nombre').value   = 'Compra total (caso de estudio)';
  f.querySelector('.d-item-precio').value   = 580;
  f.querySelector('.d-item-cantidad').value = 1;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cargarCasoF() {
  activarEscenario('F');
  document.getElementById('f-ingreso').value                = 3000;
  document.getElementById('f-gasto-anterior').value         = 1800;
  document.getElementById('f-gasto-actual').value           = 2400;
  document.getElementById('f-precio-basico-anterior').value = 500;
  document.getElementById('f-precio-basico-actual').value   = 680;
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── INICIALIZACIÓN ── */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.esc-btn').forEach(function(b) {
    b.addEventListener('click', function() { activarEscenario(b.getAttribute('data-escenario')); });
  });
});
