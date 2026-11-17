# ValidaYa: validadores de documentos españoles

Sitio estático con herramientas gratuitas para comprobar DNI/NIE, CIF, IBAN, cuentas CCC, referencias catastrales, NIF-IVA y número de la Seguridad Social, una a una o por lotes con exportación a CSV. Todo se calcula en el navegador, sin servidor ni base de datos, y no necesita mantenimiento.

## Estructura

- `assets/validadores.js`: los algoritmos (puros, se pueden probar con Node).
- `assets/app.js`: la interfaz (comprobación en vivo y por lotes).
- `assets/estilo.css`: los estilos, con modo claro y oscuro.
- `build.js`: genera `public/` a partir de la lista `PAGINAS`, junto con `sitemap.xml` y `robots.txt`.

```bash
node build.js
python -m http.server 8765 --directory public
```

## Publicación (gratis, en GitHub Pages)

El flujo `.github/workflows/publicar.yml` ejecuta `node build.js` y publica `public/` en cada push a `main`. La primera vez hay que ir a **Settings → Pages → Source** y elegir **GitHub Actions**.

1. En `build.js`, pon en `SITIO.dominio` la dirección `https://TU_USUARIO.github.io/validaya`.
2. **Rellena la página de privacidad** con tu nombre y tu correo de contacto.
3. **Date de alta en Google Search Console** (propiedad de tipo «prefijo de URL») y envía `sitemap.xml`.

## Monetización

- **Donaciones:** pon tu enlace de Ko-fi, Buy Me a Coffee o GitHub Sponsors en `SITIO.donaciones.url`.
- **Afiliados:** en `SITIO.afiliados` hay un hueco por herramienta. Pega la URL de afiliado que te den y la recomendación aparece marcada como «Publicidad». Mientras la URL esté vacía, no se muestra nada.
- **AdSense (requiere dominio propio):** cuando haya tráfico (unas 50-100 visitas al día), compra un dominio, configúralo en Settings → Pages → Custom domain, actualiza `SITIO.dominio` y solicita AdSense. Cuando te aprueben:
   - pega tu id `ca-pub-…` en `SITIO.adsenseCliente`;
   - activa el banner de consentimiento de cookies de Google (la CMP de AdSense), obligatorio en la UE;
   - añade el `ads.txt` que te dé AdSense a la carpeta `public/` (o genéralo desde `build.js`).

## Cómo hacerlo crecer

- **Una herramienta nueva cada 1-2 semanas.** Cada página es una nueva puerta de entrada desde Google. Ideas que encajan: código de cuenta de cotización de empresa, validar matrículas, código postal → provincia, números de teléfono españoles, número de pasaporte, código CNAE…
- **Enlázalas entre sí** y añade contenido útil (cómo se calcula, errores típicos). Eso es lo que posiciona.
- **Monetización extra:** enlaces de afiliación a programas de facturación o gestorías en las páginas de CIF e IBAN, y más adelante una API de pago para validar en masa.

## Expectativas realistas

Las primeras semanas no entrará nada. Con unas 10-20 herramientas bien posicionadas, lo razonable es sacar decenas de euros al mes, y con suerte algo más de cien. Ya funcionando, el mantenimiento es casi cero.
