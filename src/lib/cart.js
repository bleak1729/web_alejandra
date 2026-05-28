import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useCartStore } from '../store/cartStore';

function cartRef() {
  if (!auth.currentUser) throw new Error('Auth requerida');
  return doc(db, 'carrito', auth.currentUser.uid);
}

export async function writeCart(items) {
  await setDoc(cartRef(), {
    usuarioId: auth.currentUser.uid,
    items,
    actualizadoEn: serverTimestamp(),
  });
}

export async function addToCart(producto, cantidad = 1) {
  const items = [...useCartStore.getState().items];
  const idx = items.findIndex((i) => i.productoId === producto.id);
  if (idx >= 0) items[idx].cantidad += cantidad;
  else items.push({
    productoId: producto.id,
    nombre: producto.nombre,
    cantidad,
    precio: producto.precio,
    imagenURL: producto.imagenURL ?? '',
  });
  await writeCart(items);
}

export async function updateCartItem(productoId, cantidad) {
  const items = useCartStore.getState().items
    .map((i) => i.productoId === productoId ? { ...i, cantidad } : i)
    .filter((i) => i.cantidad > 0);
  await writeCart(items);
}

export async function removeFromCart(productoId) {
  await updateCartItem(productoId, 0);
}

export async function clearCart() {
  await writeCart([]);
}
