import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = getFirestore();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * crearPedido — callable.
 * Crea PaymentIntent en Stripe (si configurado) y un pedido "pendiente".
 * El descuento de stock + paso a "confirmado" ocurre en el webhook (atómico).
 */
export const crearPedido = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login requerido');

  const { items, direccionEnvio, metodoPago } = req.data ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Items vacío');
  }

  // Precios autoritativos desde Firestore (nunca confiar en cliente)
  const detalle = [];
  let total = 0;
  for (const it of items) {
    const ref = db.collection('productos').doc(it.productoId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', `Producto ${it.productoId}`);
    const p = snap.data();
    if (!p.activo) throw new HttpsError('failed-precondition', `${p.nombre} no disponible`);
    if (p.stock < it.cantidad) throw new HttpsError('failed-precondition', `Stock insuficiente: ${p.nombre}`);
    const subtotal = +(p.precio * it.cantidad).toFixed(2);
    total += subtotal;
    detalle.push({
      productoId: it.productoId,
      nombre: p.nombre,
      cantidad: it.cantidad,
      precioUnitario: p.precio,
      subtotal,
    });
  }
  total = +total.toFixed(2);

  const pedidoRef = db.collection('pedidos').doc();
  let pagoId = '';
  let clientSecret = null;

  if (metodoPago === 'stripe' && stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { pedidoId: pedidoRef.id, uid },
      automatic_payment_methods: { enabled: true },
    });
    pagoId = intent.id;
    clientSecret = intent.client_secret;
  }

  await pedidoRef.set({
    id: pedidoRef.id,
    usuarioId: uid,
    items: detalle,
    total,
    estado: 'pendiente',
    metodoPago: metodoPago ?? 'manual',
    pagoId,
    direccionEnvio: direccionEnvio ?? {},
    creadoEn: FieldValue.serverTimestamp(),
    actualizadoEn: FieldValue.serverTimestamp(),
  });

  return { pedidoId: pedidoRef.id, clientSecret, total };
});

/**
 * stripeWebhook — descuento atómico de stock + confirmación.
 * Configurar endpoint con webhook secret en STRIPE_WEBHOOK_SECRET.
 */
export const stripeWebhook = onRequest({ cors: false }, async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).send('Stripe no configurado');
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
    return;
  }

  if (event.type !== 'payment_intent.succeeded') {
    res.json({ received: true });
    return;
  }

  const intent = event.data.object;
  const pedidoId = intent.metadata?.pedidoId;
  if (!pedidoId) { res.json({ received: true }); return; }

  try {
    await db.runTransaction(async (tx) => {
      const pedidoRef = db.collection('pedidos').doc(pedidoId);
      const pedidoSnap = await tx.get(pedidoRef);
      if (!pedidoSnap.exists) throw new Error('Pedido no encontrado');
      const pedido = pedidoSnap.data();
      if (pedido.estado === 'confirmado') return; // idempotente

      // Validar y descontar stock
      const productos = await Promise.all(
        pedido.items.map((i) => tx.get(db.collection('productos').doc(i.productoId)))
      );
      productos.forEach((snap, idx) => {
        const p = snap.data();
        const it = pedido.items[idx];
        if (!p || p.stock < it.cantidad) {
          throw new Error(`Stock insuficiente: ${it.nombre}`);
        }
      });
      productos.forEach((snap, idx) => {
        const it = pedido.items[idx];
        tx.update(snap.ref, {
          stock: FieldValue.increment(-it.cantidad),
          actualizadoEn: FieldValue.serverTimestamp(),
        });
        const movRef = db.collection('stock_movimientos').doc();
        tx.set(movRef, {
          productoId: it.productoId,
          tipo: 'salida',
          cantidad: it.cantidad,
          motivo: 'venta',
          pedidoId,
          adminId: '',
          fecha: FieldValue.serverTimestamp(),
        });
      });

      tx.update(pedidoRef, {
        estado: 'confirmado',
        actualizadoEn: FieldValue.serverTimestamp(),
      });
      tx.set(db.collection('carrito').doc(pedido.usuarioId), {
        usuarioId: pedido.usuarioId,
        items: [],
        actualizadoEn: FieldValue.serverTimestamp(),
      });
    });

    // TODO: enviar email de confirmación vía Trigger Email o SendGrid
    res.json({ received: true });
  } catch (err) {
    console.error('Error procesando webhook:', err);
    res.status(500).send(err.message);
  }
});
