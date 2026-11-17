/* Interfaz de las herramientas: comprobación individual y por lotes. */
(function () {
  "use strict";
  const V = window.Validadores;
  const tipo = document.body.dataset.tipo || "auto";
  const $ = (id) => document.getElementById(id);

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* --- Comprobación individual, en vivo --- */
  const entrada = $("entrada");
  const caja = $("resultado");
  function comprobar() {
    const valor = entrada.value.trim();
    if (!valor) { caja.className = "resultado"; caja.innerHTML = ""; return; }
    const r = V.validar(valor, tipo);
    caja.className = "resultado visible " + (r.valido ? "ok" : "mal");
    let html = "<strong>" + (r.valido ? "✓ " : "✗ ") + escapar(r.mensaje) + "</strong>";
    const lineas = [];
    if (r.tipo) lineas.push("Tipo: " + escapar(r.tipo));
    if (r.normalizado) lineas.push("Normalizado: <code>" + escapar(r.normalizado) + "</code>");
    if (r.partes) {
      lineas.push(r.partes.map(([k, val]) => escapar(k) + " <code>" + escapar(val) + "</code>").join(" · "));
    }
    if (r.sugerencia) lineas.push("Valor corregido: <code>" + escapar(r.sugerencia) + "</code>");
    if (lineas.length) html += '<div class="detalle">' + lineas.join("<br>") + "</div>";
    caja.innerHTML = html;
  }
  if (entrada) {
    entrada.addEventListener("input", comprobar);
    $("form-individual").addEventListener("submit", (e) => { e.preventDefault(); comprobar(); });
  }

  /* --- Lotes --- */
  const lote = $("lote");
  let filas = [];
  function validarLote() {
    const lineas = lote.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    filas = lineas.map((l) => ({ entrada: l, r: V.validar(l, tipo) }));
    const validos = filas.filter((f) => f.r.valido).length;
    $("resumen-lote").textContent = filas.length
      ? filas.length + " comprobados · " + validos + " válidos · " + (filas.length - validos) + " con errores"
      : "Pega al menos un valor (uno por línea).";
    $("tabla-lote").innerHTML = filas.length
      ? "<table><thead><tr><th>Valor</th><th>Resultado</th><th>Detalle</th></tr></thead><tbody>" +
        filas.map((f) =>
          "<tr><td><code>" + escapar(f.entrada) + "</code></td>" +
          '<td class="' + (f.r.valido ? "valido" : "invalido") + '">' + (f.r.valido ? "Válido" : "No válido") + "</td>" +
          "<td>" + escapar(f.r.mensaje) + (f.r.sugerencia ? " <code>" + escapar(f.r.sugerencia) + "</code>" : "") + "</td></tr>"
        ).join("") + "</tbody></table>"
      : "";
    $("descargar").hidden = !filas.length;
  }
  function csv(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
  function descargar() {
    const cab = ["valor", "valido", "tipo", "normalizado", "mensaje", "sugerencia"];
    const cuerpo = filas.map((f) => [f.entrada, f.r.valido ? "si" : "no", f.r.tipo, f.r.normalizado, f.r.mensaje, f.r.sugerencia].map(csv).join(";"));
    const blob = new Blob(["﻿" + [cab.join(";")].concat(cuerpo).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "validacion-" + tipo + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  if (lote) {
    $("btn-lote").addEventListener("click", validarLote);
    $("descargar").addEventListener("click", descargar);
  }
})();
