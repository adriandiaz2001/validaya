/*
 * Generador del sitio estático. Uso:  node build.js
 * Crea la carpeta public/ lista para subir a cualquier hosting estático
 * (Cloudflare Pages, Netlify, GitHub Pages…).
 *
 * Para añadir una herramienta nueva: añade su validador en assets/validadores.js
 * y una entrada en PAGINAS. Nada más.
 */
const fs = require("fs");
const path = require("path");

const SITIO = {
  nombre: "ValidaYa",                 // cámbialo por tu marca
  dominio: "https://adriandiaz2001.github.io/validaya",  // cámbialo cuando tengas dominio propio (sin barra final)
  // Cuando AdSense te apruebe, pega aquí tu id (ca-pub-XXXXXXXXXXXXXXXX). Vacío = sin anuncios.
  adsenseCliente: "",

  // Enlace de donaciones (Ko-fi, Buy Me a Coffee, GitHub Sponsors…). Vacío = no se muestra.
  donaciones: { url: "", texto: "☕ Invítame a un café" },

  // Recomendaciones de afiliado por herramienta (la clave es el "tipo" de la página).
  // Mientras "url" esté vacía, no se muestra nada. Se marcan como «Publicidad», como exige la ley (LSSI).
  afiliados: {
    cif:    { url: "", titulo: "¿Facturas a empresas?", texto: "Un programa de facturación valida los NIF de tus clientes y presenta los impuestos por ti.", boton: "Probar gratis" },
    nifiva: { url: "", titulo: "¿Vendes a otros países de la UE?", texto: "Un programa de facturación calcula el IVA intracomunitario y prepara el modelo 349.", boton: "Probar gratis" },
    iban:   { url: "", titulo: "¿Buscas una cuenta sin comisiones?", texto: "Cuentas para particulares y autónomos sin comisiones de mantenimiento.", boton: "Ver la cuenta" },
    ccc:    { url: "", titulo: "¿Buscas una cuenta sin comisiones?", texto: "Cuentas para particulares y autónomos sin comisiones de mantenimiento.", boton: "Ver la cuenta" },
    nss:    { url: "", titulo: "¿Contratas trabajadores?", texto: "Una gestoría online se encarga de altas, nóminas y seguros sociales por una cuota mensual.", boton: "Ver precios" },
  },
};

const PAGINAS = [
  {
    archivo: "index.html",
    tipo: "auto",
    menu: "Inicio",
    titulo: "Validar DNI, NIE, CIF, IBAN y Nº de la Seguridad Social online",
    descripcion: "Comprueba gratis si un DNI, NIE, CIF, IBAN o número de la Seguridad Social es correcto. Detecta el tipo solo, valida listas enteras y no envía tus datos a ningún servidor.",
    h1: "Comprobar documentos españoles",
    entradilla: "Escribe o pega un DNI, NIE, CIF, IBAN, cuenta CCC, referencia catastral, NIF-IVA o número de la Seguridad Social: detectamos qué es y te decimos si es correcto. Todo se calcula en tu navegador.",
    placeholder: "Ej.: 12345678Z, B12345674, ES91 2100 0418 4502 0005 1332",
    loteAyuda: "Pega una lista mezclada (uno por línea). Cada valor se detecta y valida por separado.",
    contenido: `
<h2>Herramientas</h2>
<div class="herramientas">
  <a class="tarjeta" href="validar-dni-nie.html"><strong>DNI y NIE</strong><p>Comprueba la letra y calcula la correcta.</p></a>
  <a class="tarjeta" href="validar-cif.html"><strong>CIF / NIF de empresa</strong><p>Valida el carácter de control y el tipo de entidad.</p></a>
  <a class="tarjeta" href="validar-iban.html"><strong>IBAN</strong><p>Cuentas españolas y europeas, con los dígitos internos.</p></a>
  <a class="tarjeta" href="validar-numero-seguridad-social.html"><strong>Nº Seguridad Social</strong><p>Comprueba los dos dígitos de control.</p></a>
  <a class="tarjeta" href="convertir-ccc-a-iban.html"><strong>Convertir CCC a IBAN</strong><p>Pasa una cuenta de 20 dígitos a IBAN, comprobándola antes.</p></a>
  <a class="tarjeta" href="validar-referencia-catastral.html"><strong>Referencia catastral</strong><p>Comprueba las dos letras de control de un inmueble.</p></a>
  <a class="tarjeta" href="validar-nif-iva-intracomunitario.html"><strong>NIF-IVA intracomunitario</strong><p>Formato de los 27 países de la UE y NIF español completo.</p></a>
</div>
<h2>¿Para qué sirve?</h2>
<p>Para detectar errores de tecleo antes de que causen problemas: una transferencia devuelta, una factura con el NIF mal, un alta que rechaza la administración o una base de datos de clientes llena de valores imposibles. Todos estos documentos llevan un dígito o letra de control calculado a partir del resto, así que un error en una sola cifra casi siempre se detecta.</p>
<p>La validación por lotes está pensada para quien trabaja con listas: gestorías, departamentos de administración y desarrolladores que limpian datos. Pega la columna de tu Excel, revisa los errores y descarga el resultado en CSV.</p>`,
    faq: [
      ["¿Que un documento sea «válido» significa que existe?", "No. Significa que su estructura y su dígito o letra de control son correctos. Ninguna herramienta pública puede decirte si un DNI, una cuenta o un número de afiliación existen de verdad ni a quién pertenecen."],
      ["¿Guardáis los datos que escribo?", "No. Los cálculos se hacen con JavaScript en tu propio navegador y nada de lo que escribes se envía a ningún servidor. Puedes comprobarlo desconectando internet: la herramienta sigue funcionando."],
      ["¿Puedo validar una lista de Excel?", "Sí. Copia la columna, pégala en el cuadro de validación por lotes y pulsa «Validar lista». Puedes descargar el resultado en CSV para abrirlo de nuevo en Excel."],
    ],
  },
  {
    archivo: "validar-dni-nie.html",
    tipo: "dni",
    menu: "DNI / NIE",
    titulo: "Validar DNI y NIE online: comprobar y calcular la letra",
    descripcion: "Comprueba si la letra de un DNI o NIE es correcta y calcula la letra que le corresponde. Gratis, al instante y sin enviar tus datos.",
    h1: "Comprobar la letra del DNI y del NIE",
    entradilla: "Escribe un DNI (8 números y letra) o un NIE (X, Y o Z, 7 números y letra). Si la letra no cuadra, te decimos cuál es la correcta.",
    placeholder: "Ej.: 12345678Z o X1234567L",
    loteAyuda: "Un DNI o NIE por línea. Admite espacios, puntos y guiones.",
    contenido: `
<h2>Cómo se calcula la letra del DNI</h2>
<p>La letra es un control matemático: se divide el número entre 23 y el resto, de 0 a 22, indica una posición en esta tabla:</p>
<div class="tabla-envoltorio"><table>
<tr><th>Resto</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td></tr>
<tr><th>Letra</th><td>T</td><td>R</td><td>W</td><td>A</td><td>G</td><td>M</td><td>Y</td><td>F</td><td>P</td><td>D</td><td>X</td><td>B</td></tr>
<tr><th>Resto</th><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td></td></tr>
<tr><th>Letra</th><td>N</td><td>J</td><td>Z</td><td>S</td><td>Q</td><td>V</td><td>H</td><td>L</td><td>C</td><td>K</td><td>E</td><td></td></tr>
</table></div>
<p>Por ejemplo, 12345678 entre 23 da de resto 14, así que la letra es la Z: <code>12345678Z</code>. Las letras I, Ñ, O y U no se usan para evitar confusiones con otros caracteres.</p>
<h2>Y la del NIE</h2>
<p>El NIE de las personas extranjeras usa la misma tabla. Antes de dividir, la letra inicial se sustituye por un número: X por 0, Y por 1 y Z por 2. Así, <code>X1234567</code> se calcula como 01234567, cuyo resto es 19, y la letra es la L.</p>
<p>Los NIF que empiezan por K, L o M (menores de 14 años sin DNI, españoles residentes en el extranjero y extranjeros sin NIE) siguen la misma regla con sus 7 cifras.</p>`,
    faq: [
      ["¿Esta herramienta me dice de quién es un DNI?", "No, ni puede hacerlo. Solo comprueba que la letra encaja con el número. Que la letra sea correcta no garantiza que el documento exista."],
      ["¿Qué hago si mi DNI tiene menos de 8 cifras?", "Los DNI antiguos con menos cifras se completan con ceros a la izquierda. Puedes escribirlo sin ceros: la herramienta los añade."],
      ["¿Sirve para el NIF de empresas?", "El NIF de las empresas (el antiguo CIF) tiene otro cálculo. Usa el validador de CIF."],
    ],
  },
  {
    archivo: "validar-cif.html",
    tipo: "cif",
    menu: "CIF",
    titulo: "Validar CIF online: comprobar el NIF de una empresa",
    descripcion: "Comprueba si un CIF o NIF de empresa es correcto, calcula su carácter de control y descubre qué tipo de entidad es (SL, SA, asociación…).",
    h1: "Comprobar un CIF o NIF de empresa",
    entradilla: "Escribe el NIF de una sociedad, asociación u organismo. Validamos el carácter de control y te decimos qué tipo de entidad indica su letra.",
    placeholder: "Ej.: B12345674",
    loteAyuda: "Un CIF por línea: ideal para revisar la cartera de proveedores o clientes.",
    contenido: `
<h2>Estructura de un CIF</h2>
<p>Tiene 9 caracteres: una <strong>letra</strong> que indica el tipo de entidad, <strong>7 cifras</strong> (las dos primeras eran históricamente la provincia) y un <strong>carácter de control</strong>, que puede ser un número o una letra.</p>
<h2>Cómo se calcula el control</h2>
<ol>
<li>Se suman las cifras en posición par (2ª, 4ª y 6ª).</li>
<li>Cada cifra en posición impar (1ª, 3ª, 5ª y 7ª) se multiplica por 2 y se suman los dígitos del resultado (14 cuenta como 1 + 4).</li>
<li>Se suman ambos totales y se toma la última cifra. El control es 10 menos esa cifra (0 si da 10).</li>
<li>Si el control debe ser una letra, se usa la equivalencia 0 = J, 1 = A, 2 = B… 9 = I.</li>
</ol>
<p>Las sociedades anónimas y limitadas (A, B), las comunidades de bienes (E) y las de propietarios (H) llevan número; los organismos públicos, entidades religiosas y extranjeras (P, Q, R, S, N, W) llevan letra; el resto admite cualquiera de las dos.</p>
<h2>Letras de tipo de entidad</h2>
<p>A: sociedad anónima · B: sociedad limitada · C: colectiva · D: comanditaria · E: comunidad de bienes · F: cooperativa · G: asociación o fundación · H: comunidad de propietarios · J: sociedad civil · N: entidad extranjera · P: corporación local · Q: organismo público · R: congregación religiosa · S: órgano del Estado · U: UTE · V: otros · W: establecimiento permanente de no residente.</p>`,
    faq: [
      ["¿CIF y NIF son lo mismo?", "Desde 2008 el CIF se llama oficialmente NIF de persona jurídica, pero la estructura y el cálculo no cambiaron. Mucha gente sigue llamándolo CIF."],
      ["¿Me dice si la empresa existe o está activa?", "No. Solo verifica que el número esté bien formado. Para saber si una empresa existe consulta el Registro Mercantil o el censo de la Agencia Tributaria."],
    ],
  },
  {
    archivo: "validar-iban.html",
    tipo: "iban",
    menu: "IBAN",
    titulo: "Validar IBAN online: comprobar una cuenta bancaria",
    descripcion: "Comprueba si un IBAN es correcto antes de hacer una transferencia. Valida cuentas españolas (también sus dígitos internos) y de otros países europeos.",
    h1: "Comprobar un IBAN",
    entradilla: "Pega un IBAN con o sin espacios. En las cuentas españolas comprobamos además los dígitos de control internos y separamos entidad, oficina y cuenta.",
    placeholder: "Ej.: ES91 2100 0418 4502 0005 1332",
    loteAyuda: "Un IBAN por línea: útil para revisar remesas de recibos o pagos a proveedores.",
    contenido: `
<h2>Cómo es un IBAN español</h2>
<p>Tiene 24 caracteres: <code>ES</code>, 2 dígitos de control del IBAN y los 20 dígitos de la cuenta de siempre: 4 de la entidad, 4 de la oficina, 2 de control y 10 del número de cuenta.</p>
<h2>Dos comprobaciones en una</h2>
<p><strong>Control del IBAN:</strong> se mueven los cuatro primeros caracteres al final, se convierten las letras en números (A = 10, B = 11… Z = 35) y el número resultante, dividido entre 97, debe dar resto 1. Es el estándar internacional ISO 13616.</p>
<p><strong>Control de la cuenta española:</strong> los dos dígitos que van tras la oficina se calculan con pesos sobre la entidad y la oficina (el primero) y sobre el número de cuenta (el segundo). Si no cuadran, lo más probable es que haya una cifra mal escrita.</p>`,
    faq: [
      ["¿Un IBAN válido garantiza que la cuenta existe?", "No. Garantiza que el número está bien construido, lo que evita la mayoría de errores de tecleo. Solo el banco puede confirmar que la cuenta existe y quién es su titular."],
      ["¿Funciona con cuentas de otros países?", "Sí: comprueba la longitud de los países europeos más habituales y el control internacional de cualquier IBAN."],
      ["¿Es seguro pegar aquí mi IBAN?", "Sí. El cálculo se hace en tu navegador y nada sale de tu ordenador."],
    ],
  },
  {
    archivo: "validar-numero-seguridad-social.html",
    tipo: "nss",
    menu: "Nº Seg. Social",
    titulo: "Validar número de la Seguridad Social (NUSS) online",
    descripcion: "Comprueba si un número de afiliación a la Seguridad Social (NUSS o NAF) es correcto y calcula sus dígitos de control. Gratis y sin enviar datos.",
    h1: "Comprobar el número de la Seguridad Social",
    entradilla: "Escribe las 12 cifras del número de afiliación, con o sin barras. Te decimos si los dos dígitos de control son correctos.",
    placeholder: "Ej.: 28/12345678/40",
    loteAyuda: "Un número por línea: útil para revisar altas de trabajadores antes de enviarlas.",
    contenido: `
<h2>Estructura del número</h2>
<p>El número de afiliación tiene 12 cifras: <strong>2 de la provincia</strong> donde se asignó, <strong>8 del número</strong> y <strong>2 de control</strong>. Suele escribirse así: <code>28/12345678/40</code>.</p>
<h2>Cómo se calculan los dígitos de control</h2>
<p>Si el número central es menor de 10.000.000, se calcula provincia × 10.000.000 + número. Si no, se juntan la provincia y el número en una sola cifra de 10 dígitos. El resultado se divide entre 97 y el resto, escrito con dos cifras, son los dígitos de control.</p>`,
    faq: [
      ["¿Dónde encuentro mi número de la Seguridad Social?", "Aparece en tus nóminas y en tu informe de vida laboral, que puedes descargar en la sede electrónica de la Seguridad Social (Import@ss)."],
      ["¿NUSS, NAF y número de afiliación son lo mismo?", "Sí, son nombres distintos para el mismo número personal que te asigna la Seguridad Social."],
    ],
  },
  {
    archivo: "convertir-ccc-a-iban.html",
    tipo: "ccc",
    menu: "CCC → IBAN",
    titulo: "Convertir CCC a IBAN online: calcular el IBAN de una cuenta",
    descripcion: "Convierte una cuenta bancaria de 20 dígitos (CCC) en IBAN español. Comprueba antes los dígitos de control para no arrastrar errores. También en lote.",
    h1: "Convertir una cuenta CCC a IBAN",
    entradilla: "Escribe los 20 dígitos de la cuenta, con o sin espacios. Comprobamos que la cuenta sea correcta y te damos su IBAN.",
    placeholder: "Ej.: 2100 0418 45 0200051332",
    loteAyuda: "Una cuenta por línea: convierte de una vez la columna de cuentas antiguas de tu Excel. El CSV incluye el IBAN de cada una.",
    contenido: `
<h2>De CCC a IBAN en dos pasos</h2>
<p>El CCC (código cuenta cliente) es el número de cuenta de 20 dígitos que se usaba en España antes del IBAN: 4 de la entidad, 4 de la oficina, 2 de control y 10 del número de cuenta. El IBAN español es ese mismo número con <code>ES</code> y dos dígitos de control delante.</p>
<ol>
<li><strong>Se comprueba la cuenta.</strong> Los dos dígitos centrales se recalculan a partir de la entidad y la oficina (el primero) y del número de cuenta (el segundo). Si no cuadran, la cuenta tiene un error y no tiene sentido convertirla.</li>
<li><strong>Se calculan los dígitos del IBAN.</strong> Se pone la cuenta seguida de <code>ES00</code>, se cambian las letras por números (E = 14, S = 28) y se calcula 98 menos el resto de dividir entre 97.</li>
</ol>
<p>Ejemplo: la cuenta <code>2100 0418 45 0200051332</code> corresponde al IBAN <code>ES91 2100 0418 4502 0005 1332</code>.</p>`,
    faq: [
      ["¿Sigue sirviendo el número de cuenta de 20 dígitos?", "Desde 2014, para domiciliaciones y transferencias se usa el IBAN. El CCC sigue estando dentro del IBAN, así que basta con convertirlo."],
      ["¿Puedo convertir muchas cuentas a la vez?", "Sí. Pega la columna en el cuadro de lotes y descarga el CSV: la columna «normalizado» contiene el IBAN de cada cuenta correcta."],
      ["¿Y si mi cuenta no es española?", "Las cuentas de otros países ya tienen su propio IBAN y no siguen el formato CCC. Puedes comprobarlas en el validador de IBAN."],
    ],
  },
  {
    archivo: "validar-referencia-catastral.html",
    tipo: "catastro",
    menu: "Ref. catastral",
    titulo: "Validar referencia catastral online: comprobar las letras de control",
    descripcion: "Comprueba si una referencia catastral de 20 caracteres es correcta y calcula sus letras de control. Útil para escrituras, IBI, compraventas y alquileres.",
    h1: "Comprobar una referencia catastral",
    entradilla: "Escribe los 20 caracteres de la referencia catastral del inmueble. Comprobamos las dos letras de control y separamos sus partes.",
    placeholder: "Ej.: 7837301VG8173B0001TT",
    loteAyuda: "Una referencia por línea: útil para revisar carteras de inmuebles antes de un contrato o una declaración.",
    contenido: `
<h2>Partes de la referencia catastral</h2>
<p>Identifica cada inmueble de forma única y tiene 20 caracteres:</p>
<ul>
<li><strong>14 de la parcela</strong>: 7 de la finca y 7 de la hoja del plano en la que está (en suelo rústico codifican provincia, municipio, sector, polígono y parcela).</li>
<li><strong>4 del cargo</strong>: el número de inmueble dentro de la parcela, por ejemplo cada piso de un edificio.</li>
<li><strong>2 letras de control</strong>, que permiten detectar errores al copiarla.</li>
</ul>
<h2>Cómo se calculan las letras de control</h2>
<p>Cada letra se obtiene de 11 caracteres: la primera, de los 7 primeros caracteres más los 4 del cargo; la segunda, de los 7 siguientes más el cargo. Cada carácter se multiplica por un peso fijo, las letras cuentan por su posición en el alfabeto, y el resto de dividir la suma entre 23 indica la letra de control.</p>
<p>Encontrarás la referencia en el recibo del IBI, en la escritura o buscando la dirección en la Sede Electrónica del Catastro.</p>`,
    faq: [
      ["¿Una referencia válida significa que el inmueble existe?", "No. Significa que las letras de control encajan con el resto. Para ver los datos del inmueble hay que consultarlo en la Sede Electrónica del Catastro."],
      ["Tengo una referencia de 14 caracteres, ¿qué le pasa?", "Es solo la parcela. Si en ella hay varios inmuebles (un edificio de pisos), cada uno añade su cargo y sus letras de control hasta llegar a 20."],
    ],
  },
  {
    archivo: "validar-nif-iva-intracomunitario.html",
    tipo: "nifiva",
    menu: "NIF-IVA",
    titulo: "Validar NIF-IVA intracomunitario: comprobar el formato del VAT europeo",
    descripcion: "Comprueba el formato del NIF-IVA (VAT number) de los 27 países de la UE y valida por completo el NIF español detrás de «ES». Antes de facturar sin IVA.",
    h1: "Comprobar un NIF-IVA intracomunitario",
    entradilla: "Escribe el número con su prefijo de país (ES, FR, DE, PT…). Comprobamos el formato de cada país y, en los españoles, también la letra o el dígito de control.",
    placeholder: "Ej.: ESB12345674 o FR40303265045",
    loteAyuda: "Un NIF-IVA por línea: revisa tu lista de clientes europeos antes de emitir facturas intracomunitarias.",
    contenido: `
<h2>Qué es el NIF-IVA</h2>
<p>Es el número fiscal que identifica a empresas y profesionales en las operaciones entre países de la Unión Europea. Se forma con el código del país y el número fiscal nacional: en España, <code>ES</code> + NIF (por ejemplo, <code>ESB12345674</code>). Grecia usa <code>EL</code> en lugar de GR, y para Irlanda del Norte se usa <code>XI</code>.</p>
<h2>Qué comprueba esta herramienta</h2>
<ul>
<li><strong>Formato por país:</strong> longitud y tipo de caracteres de los 27 Estados miembros.</li>
<li><strong>NIF español completo:</strong> si empieza por ES, validamos la letra del DNI o NIE o el carácter de control del CIF.</li>
</ul>
<h2>Lo que no puede comprobar</h2>
<p>Para facturar sin IVA a otra empresa de la UE, su número debe estar dado de alta en el registro de operadores intracomunitarios de su país. Eso solo lo confirma el sistema VIES de la Comisión Europea. Haz primero aquí la comprobación rápida y después confírmalo en VIES.</p>`,
    faq: [
      ["¿Qué diferencia hay entre el NIF y el NIF-IVA?", "En España el número es el mismo; el NIF-IVA solo añade el prefijo ES. Pero no todas las empresas con NIF tienen NIF-IVA: hay que darse de alta en el ROI con el modelo 036."],
      ["¿Por qué un número con formato correcto puede salir como no válido en VIES?", "Porque el formato es correcto pero la empresa no está dada de alta en el registro intracomunitario, o se dio de baja."],
    ],
  },
  {
    archivo: "privacidad.html",
    menu: null,
    titulo: "Privacidad",
    descripcion: "Política de privacidad y cookies.",
    h1: "Privacidad y cookies",
    soloContenido: true,
    contenido: `
<p>Las herramientas de este sitio funcionan íntegramente en tu navegador. Los valores que escribes no se envían, no se guardan y no se registran en ningún servidor.</p>
<p>Algunas recomendaciones, marcadas como «Publicidad», son enlaces de afiliado: si contratas el servicio a través de ellos, podemos recibir una comisión sin que te cueste nada más. Este sitio también puede mostrar anuncios de Google AdSense. Google y sus socios pueden usar cookies para mostrar anuncios basados en tus visitas a este y otros sitios. Antes de instalar ninguna cookie no necesaria te pediremos tu consentimiento, y puedes gestionar la publicidad personalizada en la <a href="https://adssettings.google.com" rel="nofollow">configuración de anuncios de Google</a>.</p>
<p>Responsable: [tu nombre o razón social] · Contacto: [tu correo de contacto].</p>`,
  },
];

/* ---------------- Plantilla ---------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function plantilla(p) {
  const url = SITIO.dominio + "/" + (p.archivo === "index.html" ? "" : p.archivo);
  const menu = PAGINAS.filter((x) => x.menu)
    .map((x) => `<a href="${x.archivo}"${x.archivo === p.archivo ? ' aria-current="page"' : ""}>${x.menu}</a>`).join("");

  const datos = [{
    "@context": "https://schema.org", "@type": "WebApplication", name: p.h1, url,
    applicationCategory: "UtilitiesApplication", operatingSystem: "Cualquiera", inLanguage: "es-ES",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  }];
  if (p.faq) {
    datos.push({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }

  const adsHead = SITIO.adsenseCliente
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITIO.adsenseCliente}" crossorigin="anonymous"></script>`
    : "";
  const af = SITIO.afiliados[p.tipo];
  const anuncio = (af && af.url
    ? `<aside class="tarjeta recomendado"><span class="etiqueta">Publicidad</span><strong>${esc(af.titulo)}</strong><p>${esc(af.texto)}</p><a class="boton" href="${esc(af.url)}" rel="sponsored noopener" target="_blank">${esc(af.boton)}</a></aside>`
    : "") +
    (SITIO.adsenseCliente ? `<div class="anuncio"><!-- Pega aquí el bloque de anuncio de AdSense --></div>` : "");
  const donar = SITIO.donaciones.url
    ? ` · <a href="${esc(SITIO.donaciones.url)}" rel="noopener" target="_blank">${esc(SITIO.donaciones.texto)}</a>`
    : "";
  const donarCaja = SITIO.donaciones.url && !p.soloContenido
    ? `<p class="privacidad">¿Te ha ahorrado trabajo? Las herramientas son gratis y sin registro. <a href="${esc(SITIO.donaciones.url)}" rel="noopener" target="_blank">${esc(SITIO.donaciones.texto)}</a></p>`
    : "";

  const herramienta = p.soloContenido ? "" : `
<form class="tarjeta" id="form-individual" autocomplete="off">
  <label for="entrada">Valor a comprobar</label>
  <div class="fila">
    <input type="text" id="entrada" placeholder="${esc(p.placeholder)}" spellcheck="false" autocapitalize="characters" autofocus>
    <button type="submit">Comprobar</button>
  </div>
  <div id="resultado" class="resultado" role="status" aria-live="polite"></div>
  <p class="privacidad">🔒 Se calcula en tu navegador. No enviamos ni guardamos lo que escribes.</p>
</form>
${anuncio}
<section class="tarjeta">
  <label for="lote">Validar una lista</label>
  <p class="privacidad" style="margin-top:0">${esc(p.loteAyuda)}</p>
  <textarea id="lote" spellcheck="false" placeholder="Pega aquí, uno por línea"></textarea>
  <div class="fila" style="margin-top:10px">
    <button type="button" id="btn-lote">Validar lista</button>
    <button type="button" id="descargar" class="secundario" hidden>Descargar CSV</button>
  </div>
  <p class="resumen" id="resumen-lote"></p>
  <div class="tabla-envoltorio" id="tabla-lote"></div>
  ${donarCaja}
</section>`;

  const faq = p.faq ? `<h2>Preguntas frecuentes</h2>` +
    p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("") : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titulo)} | ${SITIO.nombre}</title>
<meta name="description" content="${esc(p.descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(p.titulo)}">
<meta property="og:description" content="${esc(p.descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231f6feb'/%3E%3Cpath d='M9 17l5 5 9-11' stroke='white' stroke-width='3.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/estilo.css">
<script type="application/ld+json">${JSON.stringify(datos.length === 1 ? datos[0] : datos)}</script>
${adsHead}
</head>
<body data-tipo="${p.tipo || ""}">
<header class="sitio"><div class="contenedor">
  <a class="marca" href="index.html">Valida<span>Ya</span></a>
  <nav class="menu" aria-label="Herramientas">${menu}</nav>
</div></header>
<main class="contenedor">
  <h1>${esc(p.h1)}</h1>
  ${p.entradilla ? `<p class="entradilla">${esc(p.entradilla)}</p>` : ""}
  ${herramienta}
  ${p.contenido}
  ${faq}
</main>
<footer><div class="contenedor">
  ${SITIO.nombre} · Herramientas gratuitas que funcionan en tu navegador · <a href="privacidad.html">Privacidad</a>${donar}<br>
  Comprobar la estructura de un documento no garantiza que exista ni identifica a su titular.
</div></footer>
${p.soloContenido ? "" : `<script src="assets/validadores.js"></script>\n<script src="assets/app.js"></script>`}
</body>
</html>
`;
}

/* ---------------- Generación ---------------- */
const salida = path.join(__dirname, "public");
fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(path.join(salida, "assets"), { recursive: true });
for (const f of fs.readdirSync(path.join(__dirname, "assets"))) {
  fs.copyFileSync(path.join(__dirname, "assets", f), path.join(salida, "assets", f));
}
for (const p of PAGINAS) fs.writeFileSync(path.join(salida, p.archivo), plantilla(p));

const hoy = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(salida, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  PAGINAS.map((p) => `  <url><loc>${SITIO.dominio}/${p.archivo === "index.html" ? "" : p.archivo}</loc><lastmod>${hoy}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(salida, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITIO.dominio}/sitemap.xml\n`);

console.log("Sitio generado en public/ (" + PAGINAS.length + " páginas)");
