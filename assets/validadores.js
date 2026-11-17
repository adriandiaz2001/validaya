/* Validadores de documentos españoles. Todo se ejecuta en el navegador: no se envía nada. */
(function (global) {
  "use strict";

  const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";

  function limpiar(s) {
    return String(s || "").toUpperCase().replace(/[\s\-.\/_]/g, "");
  }

  function resultado(valido, tipo, normalizado, mensaje, extra) {
    return Object.assign({ valido, tipo, normalizado, mensaje }, extra || {});
  }

  /* ---------- DNI / NIE / NIF especiales (K, L, M) ---------- */
  function validarDniNie(entrada) {
    const v = limpiar(entrada);
    let m, numero, tipo, normalizado;

    if ((m = v.match(/^(\d{1,8})([A-Z])$/))) {
      numero = m[1].padStart(8, "0");
      tipo = "DNI";
      normalizado = numero + m[2];
    } else if ((m = v.match(/^([XYZ])(\d{7})([A-Z])$/))) {
      numero = "XYZ".indexOf(m[1]) + m[2];
      tipo = "NIE";
      normalizado = v;
    } else if ((m = v.match(/^([KLM])(\d{7})([A-Z])$/))) {
      numero = m[2];
      tipo = "NIF especial (" + m[1] + ")";
      normalizado = v;
    } else {
      return resultado(false, null, v,
        "Formato no reconocido. Un DNI son 8 números y una letra; un NIE empieza por X, Y o Z, sigue con 7 números y acaba en letra.");
    }

    const letra = v.slice(-1);
    const esperada = LETRAS_DNI[parseInt(numero, 10) % 23];
    if (letra === esperada) {
      return resultado(true, tipo, normalizado, tipo + " válido.");
    }
    return resultado(false, tipo, normalizado,
      "La letra no corresponde. Para ese número la letra correcta es " + esperada + ".",
      { sugerencia: normalizado.slice(0, -1) + esperada });
  }

  /* ---------- CIF / NIF de personas jurídicas ---------- */
  const TIPOS_CIF = {
    A: "Sociedad anónima", B: "Sociedad de responsabilidad limitada", C: "Sociedad colectiva",
    D: "Sociedad comanditaria", E: "Comunidad de bienes o herencia yacente", F: "Sociedad cooperativa",
    G: "Asociación o fundación", H: "Comunidad de propietarios", J: "Sociedad civil",
    N: "Entidad extranjera", P: "Corporación local", Q: "Organismo público",
    R: "Congregación o institución religiosa", S: "Órgano de la Administración del Estado",
    U: "Unión temporal de empresas", V: "Otro tipo de entidad", W: "Establecimiento permanente de entidad no residente"
  };
  const LETRAS_CONTROL_CIF = "JABCDEFGHI";

  function validarCif(entrada) {
    const v = limpiar(entrada);
    const m = v.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/);
    if (!m) {
      return resultado(false, null, v,
        "Formato no reconocido. Un CIF es una letra (A, B, G…), 7 números y un carácter de control (número o letra).");
    }
    const [, letraTipo, cifras, control] = m;

    let suma = 0;
    for (let i = 0; i < 7; i++) {
      const d = parseInt(cifras[i], 10);
      if (i % 2 === 0) {           // posiciones impares (1ª, 3ª, 5ª, 7ª): se duplican
        const x = d * 2;
        suma += Math.floor(x / 10) + (x % 10);
      } else {                     // posiciones pares: se suman tal cual
        suma += d;
      }
    }
    const digito = (10 - (suma % 10)) % 10;
    const letra = LETRAS_CONTROL_CIF[digito];

    let admitidos;
    if ("PQRSNW".includes(letraTipo) || cifras.startsWith("00")) admitidos = [letra];
    else if ("ABEH".includes(letraTipo)) admitidos = [String(digito)];
    else admitidos = [String(digito), letra];

    const tipo = "CIF · " + TIPOS_CIF[letraTipo];
    if (admitidos.includes(control)) {
      return resultado(true, tipo, v, "CIF válido (" + TIPOS_CIF[letraTipo].toLowerCase() + ").");
    }
    return resultado(false, tipo, v,
      "El carácter de control no corresponde. Debería ser " + admitidos.join(" o ") + ".",
      { sugerencia: v.slice(0, -1) + admitidos[0] });
  }

  /* ---------- IBAN (cualquier país) + cuenta española ---------- */
  const LONGITUD_IBAN = {
    AD: 24, AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18, EE: 20, ES: 24,
    FI: 18, FR: 27, GB: 22, GI: 23, GR: 27, HR: 21, HU: 28, IE: 22, IS: 26, IT: 27, LI: 21,
    LT: 20, LU: 20, LV: 21, MC: 27, MT: 31, NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24,
    SI: 19, SK: 24, SM: 27
  };

  function aNumeros(s) {
    return s.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  }
  function mod97(numerico) {
    let r = 0;
    for (let i = 0; i < numerico.length; i++) r = (r * 10 + (numerico.charCodeAt(i) - 48)) % 97;
    return r;
  }
  function agrupar(s) {
    return s.replace(/(.{4})/g, "$1 ").trim();
  }
  const PESOS_CCC = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];
  function digitoCcc(diez) {
    let s = 0;
    for (let i = 0; i < 10; i++) s += parseInt(diez[i], 10) * PESOS_CCC[i];
    const d = 11 - (s % 11);
    return d === 11 ? 0 : d === 10 ? 1 : d;
  }

  function validarIban(entrada) {
    let v = limpiar(entrada);
    if (v.startsWith("IBAN")) v = v.slice(4);
    const m = v.match(/^([A-Z]{2})(\d{2})([A-Z0-9]{8,30})$/);
    if (!m) {
      return resultado(false, null, v,
        "Formato no reconocido. Un IBAN empieza por el código del país (ES, PT, FR…) y dos dígitos de control.");
    }
    const [, pais, , bban] = m;
    const longitud = LONGITUD_IBAN[pais];
    if (longitud && v.length !== longitud) {
      return resultado(false, "IBAN " + pais, agrupar(v),
        "Longitud incorrecta: un IBAN de " + pais + " tiene " + longitud + " caracteres y este tiene " + v.length + ".");
    }

    const correctos = String(98 - mod97(aNumeros(bban + pais + "00"))).padStart(2, "0");
    const okIban = mod97(aNumeros(bban + pais + v.slice(2, 4))) === 1;

    const extra = {};
    if (pais === "ES") {
      const entidad = bban.slice(0, 4), oficina = bban.slice(4, 8), dc = bban.slice(8, 10), cuenta = bban.slice(10);
      if (/^\d{20}$/.test(bban)) {
        const dcOk = String(digitoCcc("00" + entidad + oficina)) + String(digitoCcc(cuenta));
        extra.partes = [["Entidad", entidad], ["Oficina", oficina], ["Control", dc], ["Cuenta", cuenta]];
        if (dc !== dcOk) {
          return resultado(false, "IBAN ES", agrupar(v),
            "Los dígitos de control internos de la cuenta (" + dc + ") no cuadran; deberían ser " + dcOk + ". Probablemente hay un número mal escrito.",
            extra);
        }
      } else {
        return resultado(false, "IBAN ES", agrupar(v), "Un IBAN español solo puede tener números después de «ES».");
      }
    }

    if (okIban) return resultado(true, "IBAN " + pais, agrupar(v), "IBAN válido.", extra);
    return resultado(false, "IBAN " + pais, agrupar(v),
      "Los dígitos de control no corresponden. Con esa cuenta deberían ser " + correctos + ".",
      Object.assign(extra, { sugerencia: agrupar(pais + correctos + bban) }));
  }

  /* ---------- Número de la Seguridad Social (NUSS / NAF) ---------- */
  function validarNss(entrada) {
    const v = limpiar(entrada);
    const m = v.match(/^(\d{2})(\d{8})(\d{2})$/);
    if (!m) {
      return resultado(false, null, v,
        "Formato no reconocido. El número de la Seguridad Social tiene 12 cifras: 2 de provincia, 8 de número y 2 de control.");
    }
    const [, prov, num, control] = m;
    const a = parseInt(prov, 10), b = parseInt(num, 10);
    const base = b < 10000000 ? a * 10000000 + b : parseInt(prov + num, 10);
    const esperado = String(base % 97).padStart(2, "0");
    const normalizado = prov + "/" + num + "/" + control;
    if (control === esperado) {
      return resultado(true, "Nº Seguridad Social", normalizado, "Número de la Seguridad Social válido.");
    }
    return resultado(false, "Nº Seguridad Social", normalizado,
      "Los dígitos de control no corresponden. Deberían ser " + esperado + ".",
      { sugerencia: prov + "/" + num + "/" + esperado });
  }

  /* ---------- CCC (cuenta de 20 dígitos) → IBAN ---------- */
  function convertirCcc(entrada) {
    const v = limpiar(entrada);
    const m = v.match(/^(\d{4})(\d{4})(\d{2})(\d{10})$/);
    if (!m) {
      return resultado(false, null, v,
        "Formato no reconocido. Una cuenta CCC tiene 20 cifras: entidad (4), oficina (4), control (2) y cuenta (10).");
    }
    const [, entidad, oficina, dc, cuenta] = m;
    const partes = [["Entidad", entidad], ["Oficina", oficina], ["Control", dc], ["Cuenta", cuenta]];
    const dcOk = String(digitoCcc("00" + entidad + oficina)) + String(digitoCcc(cuenta));
    if (dc !== dcOk) {
      return resultado(false, "CCC", entidad + " " + oficina + " " + dc + " " + cuenta,
        "Los dígitos de control (" + dc + ") no cuadran; deberían ser " + dcOk + ". Revisa la cuenta antes de convertirla: probablemente hay una cifra mal escrita.",
        { partes });
    }
    const control = String(98 - mod97(aNumeros(v + "ES00"))).padStart(2, "0");
    const iban = agrupar("ES" + control + v);
    return resultado(true, "CCC → IBAN", iban, "Cuenta correcta. Su IBAN es " + iban + ".", { partes });
  }

  /* ---------- Referencia catastral (20 caracteres) ---------- */
  const ALFABETO_CATASTRO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789";
  const PESOS_CATASTRO = [13, 15, 12, 5, 4, 17, 9, 21, 3, 7, 1];
  const LETRAS_CATASTRO = "MQWERTYUIOPASDFGHJKLBZX";
  function letraCatastro(once) {
    let s = 0;
    for (let i = 0; i < 11; i++) {
      const c = once[i];
      s += PESOS_CATASTRO[i] * (/\d/.test(c) ? parseInt(c, 10) : ALFABETO_CATASTRO.indexOf(c) + 1);
    }
    return LETRAS_CATASTRO[s % 23];
  }

  function validarReferenciaCatastral(entrada) {
    const v = limpiar(entrada);
    if (/^[0-9A-ZÑ]{14}$/.test(v)) {
      return resultado(false, "Referencia catastral", v,
        "Has escrito solo la parcela (14 caracteres). La referencia completa de un inmueble tiene 20: añade los 4 del cargo y los 2 de control. Los encontrarás en el recibo del IBI o en la Sede del Catastro.");
    }
    if (!/^[0-9A-ZÑ]{18}[A-Z]{2}$/.test(v)) {
      return resultado(false, null, v,
        "Formato no reconocido. La referencia catastral tiene 20 caracteres: 14 de la parcela, 4 del inmueble (cargo) y 2 letras de control.");
    }
    const parcela = v.slice(0, 14), cargo = v.slice(14, 18), control = v.slice(18);
    const esperado = letraCatastro(v.slice(0, 7) + cargo) + letraCatastro(v.slice(7, 14) + cargo);
    const normalizado = parcela + " " + cargo + " " + control;
    const partes = [["Finca o parcela", parcela.slice(0, 7)], ["Hoja del plano", parcela.slice(7)], ["Inmueble (cargo)", cargo], ["Control", control]];
    if (control === esperado) {
      return resultado(true, "Referencia catastral", normalizado, "Referencia catastral válida.", { partes });
    }
    return resultado(false, "Referencia catastral", normalizado,
      "Las letras de control no corresponden. Deberían ser " + esperado + ".",
      { partes, sugerencia: parcela + cargo + esperado });
  }

  /* ---------- NIF-IVA intracomunitario ---------- */
  const FORMATO_IVA = {
    AT: [/^U\d{8}$/, "Austria"], BE: [/^[01]\d{9}$/, "Bélgica"], BG: [/^\d{9,10}$/, "Bulgaria"],
    CY: [/^\d{8}[A-Z]$/, "Chipre"], CZ: [/^\d{8,10}$/, "Chequia"], DE: [/^\d{9}$/, "Alemania"],
    DK: [/^\d{8}$/, "Dinamarca"], EE: [/^\d{9}$/, "Estonia"], EL: [/^\d{9}$/, "Grecia"],
    ES: [/^[0-9A-Z]\d{7}[0-9A-Z]$/, "España"], FI: [/^\d{8}$/, "Finlandia"], FR: [/^[0-9A-Z]{2}\d{9}$/, "Francia"],
    HR: [/^\d{11}$/, "Croacia"], HU: [/^\d{8}$/, "Hungría"],
    IE: [/^(\d{7}[A-W][A-I]?|\d[A-Z+*]\d{5}[A-W])$/, "Irlanda"], IT: [/^\d{11}$/, "Italia"],
    LT: [/^(\d{9}|\d{12})$/, "Lituania"], LU: [/^\d{8}$/, "Luxemburgo"], LV: [/^\d{11}$/, "Letonia"],
    MT: [/^\d{8}$/, "Malta"], NL: [/^\d{9}B\d{2}$/, "Países Bajos"], PL: [/^\d{10}$/, "Polonia"],
    PT: [/^\d{9}$/, "Portugal"], RO: [/^\d{2,10}$/, "Rumanía"], SE: [/^\d{10}01$/, "Suecia"],
    SI: [/^\d{8}$/, "Eslovenia"], SK: [/^\d{10}$/, "Eslovaquia"], XI: [/^(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/, "Irlanda del Norte"],
  };

  function validarNifIva(entrada) {
    const v = limpiar(entrada);
    const m = v.match(/^([A-Z]{2})([0-9A-Z+*]{2,13})$/);
    if (!m) {
      return resultado(false, null, v,
        "Formato no reconocido. Un NIF-IVA empieza por el código del país (ES, FR, DE…) seguido del número fiscal.");
    }
    const [, pais, numero] = m;
    if (pais === "GR") {
      return resultado(false, null, v, "Grecia usa el prefijo EL, no GR. Prueba con EL" + numero + ".", { sugerencia: "EL" + numero });
    }
    if (!FORMATO_IVA[pais]) {
      return resultado(false, null, v, "«" + pais + "» no es un país de la Unión Europea con NIF-IVA intracomunitario.");
    }
    const [patron, nombre] = FORMATO_IVA[pais];
    if (!patron.test(numero)) {
      return resultado(false, "NIF-IVA " + nombre, v, "El número no tiene el formato de un NIF-IVA de " + nombre + ".");
    }
    if (pais === "ES") {
      const r = /^[ABCDEFGHJNPQRSUVW]/.test(numero) ? validarCif(numero) : validarDniNie(numero);
      if (!r.valido) {
        return resultado(false, "NIF-IVA España", v, "El NIF que va detrás de «ES» no es correcto. " + r.mensaje,
          r.sugerencia ? { sugerencia: "ES" + r.sugerencia } : {});
      }
      return resultado(true, "NIF-IVA España · " + r.tipo, v,
        "Formato y NIF correctos. Para operar sin IVA, confirma en VIES que está dado de alta en el registro de operadores intracomunitarios (ROI).");
    }
    return resultado(true, "NIF-IVA " + nombre, v,
      "Formato correcto para " + nombre + ". Confirma en VIES que el número está dado de alta antes de facturar sin IVA.");
  }

  /* ---------- Detección automática ---------- */
  function detectar(entrada) {
    let v = limpiar(entrada);
    if (!v) return null;
    if (v.startsWith("IBAN")) return "iban";
    const pais = v.slice(0, 2);
    if (/^[A-Z]{2}\d{2}/.test(v) && LONGITUD_IBAN[pais] === v.length) return "iban";
    if (/^[A-Z]{2}[0-9A-Z+*]{2,13}$/.test(v) && (FORMATO_IVA[pais] || pais === "GR")) return "nifiva";
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{10,}$/.test(v)) return "iban";
    if (/^\d{20}$/.test(v)) return "ccc";
    if (/^\d[0-9A-ZÑ]{13}([0-9A-ZÑ]{4}[A-Z]{2})?$/.test(v) && /[A-ZÑ]/.test(v)) return "catastro";
    if (/^\d{12}$/.test(v)) return "nss";
    if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) return "cif";
    return "dni";
  }

  const VALIDADORES = {
    dni: validarDniNie, cif: validarCif, iban: validarIban, nss: validarNss,
    ccc: convertirCcc, catastro: validarReferenciaCatastral, nifiva: validarNifIva,
  };

  function validar(entrada, tipo) {
    const t = tipo && tipo !== "auto" ? tipo : detectar(entrada);
    if (!t) return resultado(false, null, "", "Escribe un documento para comprobarlo.");
    return VALIDADORES[t](entrada);
  }

  global.Validadores = {
    validar, detectar, validarDniNie, validarCif, validarIban, validarNss,
    convertirCcc, validarReferenciaCatastral, validarNifIva, limpiar,
  };
  if (typeof module !== "undefined") module.exports = global.Validadores;
})(typeof window !== "undefined" ? window : globalThis);
