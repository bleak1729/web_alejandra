import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useCartStore } from '../store/cartStore';
import { readGuestCart, writeGuestCart } from '../store/guestStore';
import { useToastStore } from '../store/toastStore';

function firestoreCartRef() {
  return doc(db, 'carrito', auth.currentUser.uid);
}

async function persistCart(items) {
  if (auth.currentUser) {
    await setDoc(firestoreCartRef(), {
      usuarioId: auth.currentUser.uid,
      items,
      actualizadoEn: serverTimestamp(),
    });
    // onSnapshot en AuthProvider actualiza el store
  } else {
    writeGuestCart(items);
    useCartStore.getState().setItems(items);
  }
}

export async function addToCart(producto, cantidad = 1) {
  const items = [...useCartStore.getState().items];
  const idx = items.findIndex((i) => i.productoId === producto.id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], cantidad: items[idx].cantidad + cantidad };
  } else {
    items.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio,
      imagenURL: producto.imagenURL ?? '',
    });
  }
  await persistCart(items);
  useToastStore.getState().show(`"${producto.nombre}" agregado al carrito`);
}

export async function updateCartItem(productoId, cantidad) {
  const items = useCartStore.getState().items
    .map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
    .filter((i) => i.cantidad > 0);
  await persistCart(items);
}

export async function removeFromCart(productoId) {
  await updateCartItem(productoId, 0);
}

export async function clearCart() {
  await persistCart([]);
}

// Fusiona el carrito invitado en Firestore al hacer login
export async function mergeGuestCartOnLogin(uid) {
  const guestItems = readGuestCart();
  if (guestItems.length === 0) return;

  const ref = doc(db, 'carrito', uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data().items ?? []) : [];

  const merged = [...existing];
  for (const gi of guestItems) {
    const idx = merged.findIndex((i) => i.productoId === gi.productoId);
    if (idx >= 0) merged[idx] = { ...merged[idx], cantidad: merged[idx].cantidad + gi.cantidad };
    else merged.push(gi);
  }

  await setDoc(ref, { usuarioId: uid, items: merged, actualizadoEn: serverTimestamp() });
  writeGuestCart([]);
}
