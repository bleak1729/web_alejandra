# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Versionado — leer SIEMPRE primero

**Antes de modificar cualquier cosa**, abrir [`updates.md`](./updates.md) y revisar la versión actual + historial de cambios. Es la fuente de verdad sobre el estado del proyecto.

**Después de cualquier modificación**, actualizar `updates.md`:

1. Bumpear versión según SemVer (V`MAJOR`.`MINOR`.`PATCH`):
   - `PATCH` — fix, ajuste menor, copy, estilos.
   - `MINOR` — feature nueva sin romper compat.
   - `MAJOR` — cambio incompatible (schema Firestore, rutas, API).
2. Añadir entrada nueva arriba del log con fecha + lista de cambios.
3. Sincronizar `package.json` → `"version"`.

Sin actualizar `updates.md`, el cambio se considera incompleto.

## Estado del repo

**Versión actual: ver `updates.md`** — scaffold React + Firebase completo. Build verde, dev server funcional.

---

## ESPECIFICACIÓN DEL PROYECTO

Aplicación web completa y profesional para tienda de insumos cosméticos llamada **"Vidacosmetic&mas"**, fundada en 2018. Vende materias primas e insumos para elaboración artesanal de productos de belleza, dirigida a clientes particulares y profesionales del sector cosmético.

Stack: **React + Tailwind CSS** (frontend), **Firebase** backend completo (Auth, Firestore, Storage).

### IDENTIDAD DE MARCA

- Nombre: Vidacosmetic&mas
- Slogan: "Belleza en un envase"
- Fundada: 2018
- Filosofía: Brindar los mejores insumos cosméticos con orientación profesional para que cada cliente compre lo más adecuado.
- Mensaje emocional: "Preserva tu ingrediente más esencial: tu belleza natural."

### STACK TECNOLÓGICO

**Frontend:**
- React (con React Router para navegación SPA)
- Tailwind CSS
- Context API o Zustand para estado global (carrito, usuario)

**Backend / Servicios Firebase:**
- Firebase Authentication → login/registro de clientes y admin
- Cloud Firestore → base de datos principal (productos, pedidos, usuarios, stock)
- Firebase Storage → imágenes de productos
- Firebase Hosting → despliegue de la app
- Cloud Functions (opcional) → lógica de negocio serverless (envío de emails de confirmación, actualización automática de stock al confirmar pago)

**Pagos:**
- Integración con Stripe (recomendado) o MercadoPago según región.
- Flujo: selección → carrito → checkout → confirmación → actualización de stock en Firestore automáticamente.

### ESTRUCTURA DE BASE DE DATOS — FIRESTORE

**Colección: `/productos`**
```js
{
  id: string,
  nombre: string,
  descripcion: string,
  categoria: string,           // "acidos" | "ceras" | "extractos" | etc.
  subcategoria: string,        // "complementos-varios" | "categorias"
  precio: number,
  unidad: string,              // "gr" | "ml" | "unidad" | "kg"
  imagenURL: string,           // referencia a Firebase Storage
  stock: number,               // unidades disponibles
  stockMinimo: number,         // alerta cuando stock <= stockMinimo
  activo: boolean,             // visible o no en la tienda
  destacado: boolean,          // aparece en sección de destacados
  creadoEn: timestamp,
  actualizadoEn: timestamp
}
```

**Colección: `/usuarios`** (doc id = uid de Firebase Auth)
```js
{
  uid: string,
  nombre: string,
  email: string,
  telefono: string,
  direccion: {
    calle: string,
    ciudad: string,
    pais: string,
    codigoPostal: string
  },
  rol: "cliente" | "admin",
  creadoEn: timestamp
}
```

**Colección: `/pedidos`**
```js
{
  id: string,
  usuarioId: string,
  items: [
    {
      productoId: string,
      nombre: string,
      cantidad: number,
      precioUnitario: number,
      subtotal: number
    }
  ],
  total: number,
  estado: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado",
  metodoPago: string,
  pagoId: string,              // ID de transacción de Stripe/MercadoPago
  direccionEnvio: object,
  creadoEn: timestamp,
  actualizadoEn: timestamp
}
```

**Colección: `/carrito`** (doc por usuario, sincronizado en tiempo real)
```js
{
  usuarioId: string,
  items: [
    {
      productoId: string,
      nombre: string,
      cantidad: number,
      precio: number,
      imagenURL: string
    }
  ],
  actualizadoEn: timestamp
}
```

**Colección: `/categorias`**
```js
{
  id: string,
  nombre: string,
  slug: string,
  descripcion: string,
  imagenURL: string,
  tipo: "complementos-varios" | "categorias-insumos"
}
```

**Colección: `/stock_movimientos`** (auditoría)
```js
{
  productoId: string,
  tipo: "entrada" | "salida" | "ajuste",
  cantidad: number,
  motivo: string,              // "venta" | "reposicion" | "ajuste_manual"
  pedidoId: string,            // opcional
  adminId: string,
  fecha: timestamp
}
```

**Colección: `/cursos_asesorias`**
```js
{
  id: string,
  titulo: string,
  descripcion: string,
  tipo: "curso" | "asesoria",
  precio: number,
  duracion: string,
  imagenURL: string,
  disponible: boolean,
  creadoEn: timestamp
}
```

**Reglas de seguridad Firestore:**
- Clientes: pueden leer productos activos, escribir su carrito y sus pedidos, leer/editar su perfil.
- Admin: acceso de lectura/escritura total.
- Stock y movimientos: solo escribibles por admin o Cloud Functions.
- Pedidos: solo el dueño o admin pueden leer un pedido.
- Campo `rol` en `/usuarios`: nunca escribible desde cliente — solo Functions o consola admin.

### MÓDULO DE COMPRA — FLUJO COMPLETO

**1. CATÁLOGO**
- Grid de productos con filtro por categoría, precio y disponibilidad.
- Tarjeta de producto: imagen, nombre, precio, unidad, stock disponible, botón "Agregar al carrito".
- Badge "Sin stock" automático cuando `stock = 0`.
- Badge "Últimas unidades" cuando `stock <= stockMinimo`.

**2. CARRITO**
- Sidebar o página dedicada al carrito.
- Sincronizado en Firestore en tiempo real (persiste entre sesiones).
- Modificar cantidad, eliminar ítem, ver subtotal y total.
- Validación de stock en tiempo real antes de proceder.

**3. CHECKOUT**
- Formulario de dirección de envío (o usar la guardada en perfil).
- Resumen del pedido.
- Selección de método de pago (Stripe o MercadoPago).
- Botón "Confirmar y Pagar".

**4. PROCESAMIENTO DEL PAGO**

Llamada a Cloud Function (o endpoint serverless) que:
1. Crea la intención de pago en Stripe/MercadoPago.
2. Valida stock disponible en Firestore (transacción atómica).
3. Descuenta el stock del producto en `/productos`.
4. Registra el movimiento en `/stock_movimientos`.
5. Crea el documento en `/pedidos` con estado `"confirmado"`.
6. Vacía el carrito del usuario.
7. Envía email de confirmación (via Firebase Extensions o SendGrid).

**Nunca descontar stock desde el cliente.** Validación en UI es solo para UX; la transacción del servidor es la verdad.

**5. CONFIRMACIÓN**
- Página de éxito con número de pedido y resumen.
- Historial de pedidos en el perfil del usuario.

### PANEL DE ADMINISTRACIÓN

Ruta protegida: `/admin` (solo `rol === "admin"`)

Módulos:
- **Dashboard**: métricas de ventas, pedidos recientes, alertas de stock bajo.
- **Gestión de productos**: CRUD completo. Al crear/editar: subir imagen a Firebase Storage, definir stock inicial, precio, categoría, estado activo/inactivo.
- **Gestión de stock**: ver stock actual, registrar entradas manuales, historial de movimientos por producto.
- **Gestión de pedidos**: tabla de pedidos con filtro por estado, cambiar estado (confirmar, marcar enviado, entregado, cancelar).
- **Gestión de usuarios**: listado, ver perfil, cambiar rol.
- **Gestión de categorías**: CRUD de categorías e insumos.
- **Gestión de cursos/asesorías**: CRUD del módulo de servicios.

### PÁGINAS Y ESTRUCTURA DE RUTAS

```
/                        → Inicio (hero, destacados, categorías)
/insumos                 → Catálogo general
/insumos/:categoria      → Catálogo filtrado por categoría
/producto/:id            → Detalle de producto
/carrito                 → Carrito de compras
/checkout                → Proceso de pago
/confirmacion/:pedidoId  → Confirmación de pedido
/asesorias-cursos        → Servicios disponibles
/blog                    → Artículos del blog
/contacto                → Formulario de contacto
/nosotros                → Historia de la marca
/login                   → Inicio de sesión
/registro                → Registro de cuenta
/perfil                  → Perfil y pedidos del usuario
/admin                   → Panel de administración (protegido)
/admin/productos         → Gestión de productos
/admin/stock             → Gestión de stock
/admin/pedidos           → Gestión de pedidos
/admin/usuarios          → Gestión de usuarios
/admin/categorias        → Gestión de categorías
/admin/cursos            → Gestión de cursos y asesorías
```

### DISEÑO Y ESTÉTICA

- Paleta: tonos naturales — cremas, verdes suaves, dorados, rosas pálidos.
- Tipografía: serif elegante para títulos, sans-serif limpia para cuerpo.
- Estilo: minimalista con calidez. Cosmética natural premium.
- Totalmente responsivo (mobile first).
- Animaciones suaves en hover de productos y transiciones de página.

### TONO DE COMUNICACIÓN

- Cálido, cercano y profesional.
- Empodera al cliente con conocimiento cosmético.
- Invita a explorar, descubrir y cuidarse.

---

## Comandos (una vez scaffolded)

```bash
npm run dev                       # Vite dev server
npm run build                     # build producción
npm run preview                   # preview build
firebase emulators:start          # Auth + Firestore + Functions + Storage local
firebase deploy                   # deploy completo
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
npm --prefix functions run build  # build Functions antes de deploy
```

## Notas de arquitectura

- **Zustand**: `useCartStore`, `useAuthStore`. Cart store espeja `/carrito/{uid}` vía `onSnapshot` — Firestore es fuente de verdad, store es caché viva. Mutaciones escriben a Firestore, no al store directo.
- **AuthProvider** envuelve app, suscribe a `onAuthStateChanged`, hidrata perfil desde `/usuarios/{uid}`, expone `{ user, profile, role, loading }`.
- Guards de ruta: `<RequireAuth>` y `<RequireAdmin>` leen de `useAuthStore`.
- Índices compuestos:
  - `productos`: `activo ASC, categoria ASC, creadoEn DESC`
  - `pedidos`: `usuarioId ASC, creadoEn DESC`
- Storage layout: `productos/{productoId}/{filename}`, `categorias/{slug}.jpg`.
- Tailwind tokens: `theme.extend.colors` → `crema`, `verde`, `dorado`, `rosa`. Serif (Cormorant/Playfair) para títulos, Inter para cuerpo.

## Convenciones

- Nombres de campos Firestore y slugs de ruta en **español** (no anglicizar).
- Dinero como `number` en moneda nativa. Conversión a centavos solo al crear PaymentIntent de Stripe.
- Timestamps con `serverTimestamp()`, nunca `new Date()` del cliente.
- Config Firebase en `.env` (`VITE_FIREBASE_*`), `.env` en gitignore, commitear `.env.example`.

## Decisiones pendientes

- Stripe vs MercadoPago — elegir según región del usuario antes de cablear webhooks.
- Blog: MDX estático vs Firestore — spec no lo dice. Preguntar antes de construir.
