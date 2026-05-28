// Seed Firestore con datos de ejemplo.
// Uso: node scripts/seed.js  (requiere GOOGLE_APPLICATION_CREDENTIALS o emuladores corriendo)
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (process.env.FIRESTORE_EMULATOR_HOST) {
  initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT ?? 'vidacosmetic-dev' });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  initializeApp();
} else {
  console.error('Set FIRESTORE_EMULATOR_HOST or GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}

const db = getFirestore();

const categorias = [
  { slug: 'acidos', nombre: 'Ácidos', descripcion: 'Activos exfoliantes y reparadores', tipo: 'categorias-insumos' },
  { slug: 'ceras', nombre: 'Ceras', descripcion: 'Emulsionantes y agentes de textura', tipo: 'categorias-insumos' },
  { slug: 'extractos', nombre: 'Extractos', descripcion: 'Botánicos y vegetales concentrados', tipo: 'categorias-insumos' },
  { slug: 'aceites', nombre: 'Aceites', descripcion: 'Vegetales puros y esenciales', tipo: 'categorias-insumos' },
];

const productos = [
  { nombre: 'Ácido Hialurónico 1% LMW', categoria: 'acidos', descripcion: 'Bajo peso molecular para hidratación profunda.', precio: 18.50, unidad: 'gr', stock: 50, stockMinimo: 8, destacado: true },
  { nombre: 'Cera Emulsionante BTMS-50', categoria: 'ceras', descripcion: 'Acondicionador y emulsionante catiónico.', precio: 12.00, unidad: 'gr', stock: 80, stockMinimo: 10, destacado: true },
  { nombre: 'Extracto de Centella Asiática', categoria: 'extractos', descripcion: 'Reparador y calmante natural.', precio: 22.00, unidad: 'ml', stock: 30, stockMinimo: 5, destacado: true },
  { nombre: 'Aceite de Rosa Mosqueta', categoria: 'aceites', descripcion: 'Prensado en frío, regenerador.', precio: 28.00, unidad: 'ml', stock: 6, stockMinimo: 10, destacado: true },
  { nombre: 'Niacinamida 99%', categoria: 'acidos', descripcion: 'Reduce poros y unifica el tono.', precio: 15.00, unidad: 'gr', stock: 100, stockMinimo: 15 },
  { nombre: 'Cera de Abeja Blanca', categoria: 'ceras', descripcion: 'Pura, cosmética grade.', precio: 9.50, unidad: 'gr', stock: 0, stockMinimo: 10 },
  { nombre: 'Extracto de Té Verde', categoria: 'extractos', descripcion: 'Antioxidante rico en polifenoles.', precio: 14.00, unidad: 'ml', stock: 45, stockMinimo: 8 },
  { nombre: 'Aceite de Jojoba', categoria: 'aceites', descripcion: 'Equilibra sebo, ligero.', precio: 16.00, unidad: 'ml', stock: 60, stockMinimo: 10 },
];

async function seed() {
  console.log('Sembrando categorías…');
  for (const c of categorias) {
    await db.collection('categorias').doc(c.slug).set({ ...c, id: c.slug, imagenURL: '' });
  }

  console.log('Sembrando productos…');
  const productosIds = [];
  for (const p of productos) {
    const doc = await db.collection('productos').add({
      ...p,
      subcategoria: 'categorias',
      imagenURL: '',
      activo: true,
      destacado: p.destacado ?? false,
      creadoEn: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    });
    productosIds.push(doc.id);
  }

  console.log('Sembrando cursos…');
  await db.collection('cursos_asesorias').add({
    titulo: 'Formulación cosmética básica',
    descripcion: 'Aprende los principios de la formulación segura de cremas y sueros.',
    tipo: 'curso', precio: 120, duracion: '8 horas',
    imagenURL: '', disponible: true,
    creadoEn: FieldValue.serverTimestamp(),
  });
  await db.collection('cursos_asesorias').add({
    titulo: 'Asesoría 1:1 para tu marca',
    descripcion: 'Sesión personalizada para definir línea de producto y estrategia.',
    tipo: 'asesoria', precio: 80, duracion: '1 hora',
    imagenURL: '', disponible: true,
    creadoEn: FieldValue.serverTimestamp(),
  });

  console.log('Sembrando usuarios de prueba…');
  const adminDoc = await db.collection('usuarios').add({
    nombre: 'Admin Test',
    email: 'admin@vidacosmetic.local',
    telefono: '+54 9 1234567890',
    direccion: {
      calle: 'Calle Principal 123',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      codigoPostal: '1428'
    },
    rol: 'admin',
    creadoEn: FieldValue.serverTimestamp(),
  });

  const clienteDoc = await db.collection('usuarios').add({
    nombre: 'Cliente Test',
    email: 'cliente@vidacosmetic.local',
    telefono: '+54 9 9876543210',
    direccion: {
      calle: 'Av. Secundaria 456',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      codigoPostal: '1429'
    },
    rol: 'cliente',
    creadoEn: FieldValue.serverTimestamp(),
  });

  console.log('Sembrando carrito…');
  await db.collection('carrito').doc(clienteDoc.id).set({
    usuarioId: clienteDoc.id,
    items: [
      {
        productoId: productosIds[0],
        nombre: 'Ácido Hialurónico 1% LMW',
        cantidad: 2,
        precio: 18.50,
        imagenURL: ''
      }
    ],
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  console.log('Sembrando pedidos…');
  await db.collection('pedidos').add({
    usuarioId: clienteDoc.id,
    items: [
      {
        productoId: productosIds[1],
        nombre: 'Cera Emulsionante BTMS-50',
        cantidad: 1,
        precioUnitario: 12.00,
        subtotal: 12.00
      }
    ],
    total: 12.00,
    estado: 'pendiente',
    metodoPago: 'stripe',
    pagoId: '',
    direccionEnvio: {
      calle: 'Av. Secundaria 456',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      codigoPostal: '1429'
    },
    creadoEn: FieldValue.serverTimestamp(),
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  console.log('Sembrando movimientos de stock…');
  await db.collection('stock_movimientos').add({
    productoId: productosIds[0],
    tipo: 'entrada',
    cantidad: 50,
    motivo: 'reposicion',
    adminId: adminDoc.id,
    fecha: FieldValue.serverTimestamp(),
  });

  console.log('Listo.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
