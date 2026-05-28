import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCartStore, selectCartTotal } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useGuestStore } from '../store/guestStore';
import { updateCartItem, removeFromCart } from '../lib/cart';

export default function Carrito() {
  const { items, loading } = useCartStore();
  const total = useCartStore(selectCartTotal);
  const user = useAuthStore((s) => s.user);
  const guest = useGuestStore((s) => s.guest);
  const openModal = useGuestStore((s) => s.openModal);
  const nav = useNavigate();

  if (loading) return <div className="container-app py-20 text-center text-tinta/60">Cargando carrito…</div>;

  if (items.length === 0) return (
    <div className="container-app py-20 text-center">
      <h1 className="font-serif text-3xl text-verde-900">Tu carrito está vacío</h1>
      <p className="text-tinta/60 mt-2">Explora nuestros insumos.</p>
      <Link to="/insumos" className="btn-primary mt-6 inline-flex">Ver catálogo</Link>
    </div>
  );

  function handleCheckout() {
    if (!user && !guest) {
      openModal(null, 0);
      return;
    }
    nav('/checkout');
  }

  return (
    <div className="container-app py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-4">
        <h1 className="font-serif text-3xl text-verde-900 mb-4">Tu carrito</h1>
        {items.map((it) => (
          <div key={it.productoId} className="card flex gap-4 p-4 items-center">
            <div className="w-20 h-20 rounded-lg bg-verde-100 overflow-hidden flex-shrink-0">
              {it.imagenURL && <img src={it.imagenURL} alt={it.nombre} className="w-full h-full object-cover"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-verde-900 truncate">{it.nombre}</p>
              <p className="text-sm text-tinta/60">€{it.precio.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center border border-verde-200 rounded-full">
              <button onClick={() => updateCartItem(it.productoId, it.cantidad - 1)} className="w-8 h-8">−</button>
              <span className="w-8 text-center text-sm">{it.cantidad}</span>
              <button onClick={() => updateCartItem(it.productoId, it.cantidad + 1)} className="w-8 h-8">+</button>
            </div>
            <p className="w-20 text-right font-semibold">€{(it.precio * it.cantidad).toFixed(2)}</p>
            <button onClick={() => removeFromCart(it.productoId)} className="text-tinta/40 hover:text-terracota-400 text-xl">×</button>
          </div>
        ))}
      </div>
      <aside className="card p-6 h-fit sticky top-24">
        <h3 className="font-serif text-xl text-verde-900">Resumen</h3>
        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>€{total.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-tinta/60">
          <span>Envío</span>
          <span>Calculado en checkout</span>
        </div>
        <div className="mt-4 pt-4 border-t border-verde-200 flex justify-between font-semibold">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
        <button onClick={handleCheckout} className="btn-primary w-full mt-6">
          Proceder al pago
        </button>
      </aside>
    </div>
  );
}
