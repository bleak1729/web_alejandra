# Updates — Vidacosmetic&mas

Registro de versiones. Toda modificación al proyecto debe:

1. **Bumpear versión** según [SemVer](https://semver.org):
   - `PATCH` (V1.0.X) — fix, ajuste menor, copy, estilos.
   - `MINOR` (V1.X.0) — feature nueva sin romper compat.
   - `MAJOR` (VX.0.0) — cambio incompatible (schema Firestore, rutas, API).
2. **Añadir entrada** arriba de la lista con fecha y cambios.
3. **Sincronizar** `package.json` → `version`.

---

## V1.5.0 — 2026-05-28

**Carrito para invitadas — sin registro en base de datos.**

- `src/store/guestStore.js` (nuevo): Zustand store que guarda `{ nombre, apellido, email }` y el carrito invitado exclusivamente en `localStorage` (`vc_guest`, `vc_guest_cart`). Sin escritura a Firestore ni `/usuarios`.
- `src/components/auth/GuestModal.jsx` (nuevo): Modal que aparece la primera vez que se intenta agregar un ítem sin sesión activa. Pide nombre, apellido y correo. Al confirmar guarda la sesión guest localmente y agrega el ítem al carrito localStorage.
- `src/lib/cart.js`: `addToCart`, `updateCartItem`, `removeFromCart` y `clearCart` bifurcan entre Firestore (usuario autenticado) y localStorage (invitada). Nueva función `mergeGuestCartOnLogin` que fusiona el carrito invitado en Firestore al hacer login.
- `src/providers/AuthProvider.jsx`: Al no haber usuario, inicializa el store de carrito desde `localStorage`. Al hacer login, llama `mergeGuestCartOnLogin` y limpia la sesión invitada.
- `src/components/catalog/ProductCard.jsx`: Si no hay usuario ni guest, abre `GuestModal` en vez de redirigir a `/login`.
- `src/pages/ProductoDetalle.jsx`: Idem.
- `src/pages/Carrito.jsx`: Muestra el carrito si hay usuario autenticado **o** guest. La pantalla de "Ingresa" solo aparece si no hay ninguno de los dos.
- `src/layouts/PublicLayout.jsx`: Renderiza `<GuestModal />` globalmente.

---

## V1.4.3 — 2026-05-28

**Paleta teal aplicada a todas las páginas públicas.**

- `Home.jsx`: paleta `P` migrada de blush/terracota a teal (`bg:#eef5f3`, `bgSoft:#dcebe8`, `deep:#327069`, `tint:#dcebe8`, `inkSoft:#665f52`). Newsletter section bg `#1b3f40` (verde-800 oscuro), botón submit `dorado-400 #d7a35a`.
- `Cursos.jsx`: filtros activos `verde-600`, botón "Reservar plaza" `verde-600`, badges tipo `bg-verde-100 text-verde-700`, badge "Próxima edición" `terracota-100/400`.
- `Nosotros.jsx`: CTA section `bg-crema-100` → `bg-verde-100`.
- `ProductoDetalle.jsx`: placeholder `bg-verde-100`, error stock `text-terracota-400`, quantity border `verde-200`.
- `Carrito.jsx`: thumbnails `bg-verde-100`, borders `verde-200`, botón eliminar hover `text-terracota-400`.
- `Checkout.jsx`: border total `verde-200`, error pago `text-terracota-400`.
- `Perfil.jsx`: badge cancelado `terracota-100/400`, badge pendiente `verde-100/700`.
- `Login.jsx` / `Registro.jsx`: errores `text-terracota-400`.
- `Blog.jsx`: badge categoría `bg-verde-100 text-verde-700`.

---

## V1.4.2 — 2026-05-28

**Botones y header unificados con paleta teal.**

- `Header.jsx`: fondo `bg-crema-50/85` → `bg-verde-100/90`, borde `border-crema-200` → `border-verde-200`. Header ahora en el mismo tono menta que el trust strip.
- `index.css` `.btn-primary`: `bg-verde-700` → `bg-verde-600` (teal medio), hover `bg-verde-700`.
- `Home.jsx` `BtnPrimary`: inline style cambiado de terracota `#8a5640` a teal `#327069`/`#27595a`.
- `Home.jsx` botón `+` product cards: terracota → teal `#327069`.
- `Home.jsx` íconos trust strip y eyebrow "El catálogo": terracota → teal `#327069`.
- `Catalogo.jsx` botón `+`: `bg-verde-700 hover:bg-verde-900` → `bg-verde-600 hover:bg-verde-700`.

---

## V1.4.1 — 2026-05-28

**Fondo de página ajustado al tono menta del mockup.**

- `body` background: `bg-crema-50` (`#f6f4ef`) → `bg-verde-50` (`#eef5f3`). Coincide con el tono sage/menta suave del diseño de referencia.
- `--color-bg` CSS var actualizada a `#eef5f3`.

---

## V1.4.0 — 2026-05-28

**Design System completo basado en PaletaColores/package.html.**

- `tailwind.config.js`: escala `verde` migrada a paleta teal (5 tonos del diseño: `#cce0dc → #7fb6ad → #3f8a82 → #1b3f40`, brand `#27595a`). Escala `crema` actualizada a neutros cálidos reales. Nuevas escalas `terracota` (6 tonos) y `salvia` (6 tonos). `dorado` extendido con tono 300. `tinta` actualizado a `#1d1b17`.
- Tipografía: alias `display-2xl/xl/lg/md` con line-height y tracking calibrados. Nuevos `letterSpacing` tokens: `label`, `caps`, `spaced`.
- Sombras: sistema de 4 niveles con tinte brand (`shadow-soft`, `shadow-card`, `shadow-card-lg`, `shadow-modal`).
- `src/index.css`: CSS custom properties completas (colores, sombras, overlays). Nuevas variantes de botón: `btn-ghost`, `btn-terra`, `btn-sm`, `btn-lg`. Nuevas variantes de badge: `badge-salvia`, `badge-pill`. Nuevas clases tipográficas: `heading-display`, `heading-section`, `eyebrow`. Utilidades: `section`, `section-sm`, `divider`, `overlay-*`, form helpers (`input-error`, `error-msg`, `helper-msg`).

---

## V1.3.0 — 2026-05-24

**Módulo admin reescrito con diseño dark theme (admin.html).**

- AdminLayout: sidebar dark 240px sticky, iconos unicode, logo, usuario/email desde authStore, sign out.
- Dashboard: KPIs desde Firestore (pedidos, facturación, clientes, SKUs), barchart 12 días con divs, alertas stock, pedidos recientes, top productos destacados.
- Productos: tabla dark con thumbnails gradiente, búsqueda, filtro categoría, side drawer edición, CSV export.
- Stock: chips Todos/Bajo/Agotado, grid 1.6fr/1fr stock+movimientos, modal ajuste centrado.
- Pedidos: chips por estado, tabla con order-id en gold monospace, side drawer con mini-grid, cambio de estado inline, lista de items.
- Usuarios: tabla dark con avatares gradiente circulares, búsqueda, cambio de rol inline.
- Categorias: grid auto-fill de tarjetas con thumbnail gradiente, modal edición.
- Cursos: tabla dark con TipoPill, side drawer edición, disponible pill.
- Paleta común por archivo: gold/ok/warn/danger/info/ink/faint/mute/panel/inputS (inline styles, no Tailwind).

---

## V1.2.0 — 2026-05-24

**Home rediseño según ejemplos_html/index.html (paleta blush/terracota).**

- Hero: minimal centrado con `border-bottom`, padding `7rem 0 5rem`. Sin imagen ni stats.
- H1: "Materias primas para *tu propia* cosmética natural" (4.8rem).
- Paleta completa cambiada a blush/terracota: `--sage-deep: #8a5640`, `--bg: #fbf3ec`, `--bg-soft: #f4e8dc`, `--sage-tint: #f0dcce`.
- BtnPrimary/BtnGhost: componentes reutilizables con colores inline (no afecta resto de la app).
- ProdCard add-btn: terracota `#8a5640`.
- Trust strip bg: `#f4e8dc`.
- Filosofía bg: `#f0dcce` (peach/blush tint).
- Cursos pill bg: `#f4e8dc`.

---

## V1.1.0 — 2026-05-24

**Home rediseño completo según ejemplos_html/principal.html.**

- Hero: layout 2 columnas editorial (texto izquierda / imagen derecha) reemplaza hero centrado.
- H1: "Tu fórmula / *empieza aquí.*" con float cards decorativos (lote + asesoría INCI).
- Imagen hero: bloque redondeado con gradiente sage + chip monospace + 2 float cards.
- Stats: +200 referencias, 8 años, 4.9 Google.
- Botones hero: verde-700 (sage-deep) reemplaza tinta oscuro.
- Trust strip: bg `#efe8d8` (bg-soft del ejemplo).
- ProdCard: descripcion en `font-mono` estilo INCI.
- Filosofía: bg `#dfe7d4` (sage-tint) reemplaza verde-100.
- Cursos mini-card pill: bg `#efe8d8`.
- Hover shadows en cards: `0 18px 38px rgba(0,0,0,0.06)`.

---

## V1.0.2 — 2026-05-24

**Hero redesign según mockup.**

- Fondo hero: `bg-crema-100` (crema cálida, contraste vs body crema-50).
- Padding: `pt-28 pb-32` para mayor aire visual.
- H1: `font-size` aumentado (`clamp(2.4rem, 6vw, 5rem)`), "cosmética natural" en línea propia.
- Botón primario: `bg-tinta` (oscuro) reemplaza `btn-primary` (verde) — fiel al mockup.
- Botón secundario: borde `tinta/30`, pill idéntico al mockup.

---

## V1.0.1 — 2026-05-24

**Home hero + trust strip polish.**

- Reemplazados emojis del trust strip con SVG inline (camión, hoja, escudo, birrete).
- Trust strip bg: `crema-100` → `crema-200` para coincidir con el mockup.

---

## V1.0.0 — 2026-05-24

**Scaffold inicial completo.**

### Frontend
- React 18 + Vite + React Router 6 + Tailwind 3 + Zustand 5.
- Tokens de diseño: paleta `crema`/`verde`/`dorado`/`rosa`/`tinta`; fuentes Cormorant Garamond (serif) + Inter (sans).
- Layouts: `PublicLayout` (Header sticky con carrito + Footer), `AdminLayout` (sidebar oscuro verde-900).
- Guards: `RequireAuth`, `RequireAdmin`.
- 14 páginas públicas: Home, Catalogo, ProductoDetalle, Carrito, Checkout, Confirmacion, Cursos, Blog, Contacto, Nosotros, Login, Registro, Perfil, NotFound.
- 7 páginas admin: Dashboard, Productos (CRUD + upload Storage), Stock (con movimientos), Pedidos, Usuarios, Categorias, Cursos.
- Componente `ProductCard` con badges automáticos "Sin stock" / "Últimas unidades" / "Destacado".

### Backend / Firebase
- `src/lib/firebase.js` con conexión a emuladores condicional (`VITE_USE_EMULATORS`).
- Zustand stores `useAuthStore` + `useCartStore`. Carrito espejado de `/carrito/{uid}` vía `onSnapshot`.
- `AuthProvider` hidrata perfil de `/usuarios/{uid}`; crea doc al primer login con `rol: 'cliente'`.
- `src/lib/cart.js` — todas las mutaciones de carrito pasan por Firestore.
- `firestore.rules`: `rol` no editable desde cliente; pedidos solo admin/Functions; stock_movimientos cerrado.
- `storage.rules`: lectura pública en `productos/`, escritura solo admin.
- `firestore.indexes.json`: índices compuestos para productos (activo+categoria+creadoEn) y pedidos (usuarioId+creadoEn).

### Cloud Functions (`functions/`)
- `crearPedido` (callable v2): valida items contra Firestore (precios autoritativos), crea pedido `pendiente`, crea Stripe PaymentIntent, devuelve `clientSecret`.
- `stripeWebhook` (onRequest): en `payment_intent.succeeded` ejecuta **transacción atómica** — valida stock, decrementa, escribe stock_movimientos, marca pedido `confirmado`, vacía carrito. Idempotente.

### Seed + docs
- `scripts/seed.js`: 4 categorías + 8 productos (incluye 1 sin stock + 1 con últimas unidades) + 2 cursos/asesorías.
- `README.md` con setup, Stripe wiring, deploy y promoción a admin.
- `.env.example`, `.firebaserc`, `.gitignore`.

### Pendiente (TODOs marcados)
- Wire Stripe Elements en `Checkout.jsx` para confirmar PaymentIntent con `clientSecret`.
- Integrar Firebase Trigger Email Extension o SendGrid en webhook.
- Blog: decidir MDX estático vs Firestore.
- MercadoPago: espejo de `crearPedido` si la región lo requiere.
