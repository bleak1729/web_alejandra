# Vidacosmetic&mas

Tienda online de insumos cosméticos. React + Vite + Tailwind + Firebase.

> **Belleza en un envase.** Desde 2018.

## Setup

```bash
npm install
cp .env.example .env  # rellenar credenciales Firebase
cd functions && npm install && cd ..
```

## Desarrollo

```bash
# Dev server Vite
npm run dev

# Emuladores Firebase (Auth, Firestore, Storage, Functions)
npm run emulators

# Con emuladores: setear VITE_USE_EMULATORS=true en .env

# Seed datos de ejemplo (con emuladores corriendo)
FIRESTORE_EMULATOR_HOST=localhost:8080 npm run seed
```

## Stripe

1. Crear cuenta Stripe + obtener `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`.
2. Configurar en Functions: `firebase functions:config:set stripe.secret=... stripe.webhook=...` o `.env`.
3. Endpoint webhook: `https://<region>-<project>.cloudfunctions.net/stripeWebhook`.
4. Stripe publishable key → `VITE_STRIPE_PUBLISHABLE_KEY` en `.env`.

## Hacer admin a un usuario

Después de registrarse, en consola Firebase → Firestore → `usuarios/{uid}` → cambiar `rol` a `"admin"`. La regla de seguridad bloquea cambios de rol desde el cliente.

## Despliegue

```bash
npm run build
firebase deploy
```

Despliegue parcial:

```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules,storage
```

## Estructura

- `src/lib/firebase.js` — config + conexión a emuladores.
- `src/lib/cart.js` — operaciones de carrito (todas pasan por Firestore).
- `src/store/` — Zustand stores (auth, cart).
- `src/providers/AuthProvider.jsx` — `onAuthStateChanged` + hidratación de perfil + carrito.
- `src/components/auth/` — `RequireAuth`, `RequireAdmin`.
- `src/pages/` — páginas públicas.
- `src/pages/admin/` — panel `/admin/*`.
- `functions/index.js` — `crearPedido` callable + `stripeWebhook` (descuento atómico).
- `firestore.rules` — reglas (rol no escribible desde cliente, pedidos solo admin/Functions).

## Flujo de compra

Cliente → `crearPedido` Function → crea pedido `pendiente` + PaymentIntent → cliente confirma con Stripe → webhook `payment_intent.succeeded` → transacción atómica: descuenta stock, registra movimiento, marca pedido `confirmado`, vacía carrito.

**El stock nunca se descuenta desde el cliente.**

## TODOs

- Wire Stripe Elements en `Checkout.jsx` para confirmar PaymentIntent con `clientSecret`.
- Integrar Firebase Trigger Email Extension o SendGrid en webhook.
- Blog: decidir MDX estático vs Firestore.
- MercadoPago: si la región requiere, espejo de `crearPedido` + webhook.
