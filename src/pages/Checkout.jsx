import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { useCartStore, selectCartTotal } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const profile = useAuthStore((s) => s.profile);
  const [direccion, setDireccion] = useState(profile?.direccion ?? { calle: '', ciudad: '', pais: '', codigoPostal: '' });
  const [metodoPago, setMetodoPago] = useState('stripe');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function handlePagar(e) {
    e.preventDefault();
    setProcesando(true); setError('');
    try {
      const crearPedido = httpsCallable(functions, 'crearPedido');
      const { data } = await crearPedido({
        items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        direccionEnvio: direccion,
        metodoPago,
      });
      // En entorno real: redirigir a Stripe Checkout con data.clientSecret/url
      // Stub: marcar pedido y navegar a confirmación
      nav(`/confirmacion/${data.pedidoId}`);
    } catch (err) {
      setError(err.message ?? 'Error procesando el pago');
    }
    setProcesando(false);
  }

  if (items.length === 0) {
    return <div className="container-app py-20 text-center">Carrito vacío.</div>;
  }

  return (
    <form onSubmit={handlePagar} className="container-app py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-8">
        <section>
          <h1 className="font-serif text-3xl text-verde-900 mb-6">Checkout</h1>
          <h2 className="font-serif text-xl text-verde-900 mb-4">Dirección de envío</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Calle</label>
              <input className="input" required value={direccion.calle} onChange={(e) => setDireccion({...direccion, calle: e.target.value})}/>
            </div>
            <div><label className="label">Ciudad</label>
              <input className="input" required value={direccion.ciudad} onChange={(e) => setDireccion({...direccion, ciudad: e.target.value})}/>
            </div>
            <div><label className="label">Código postal</label>
              <input className="input" required value={direccion.codigoPostal} onChange={(e) => setDireccion({...direccion, codigoPostal: e.target.value})}/>
            </div>
            <div className="col-span-2"><label className="label">País</label>
              <input className="input" required value={direccion.pais} onChange={(e) => setDireccion({...direccion, pais: e.target.value})}/>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-verde-900 mb-4">Método de pago</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 card p-4 cursor-pointer">
              <input type="radio" checked={metodoPago === 'stripe'} onChange={() => setMetodoPago('stripe')}/>
              <span>Tarjeta (Stripe)</span>
            </label>
            <label className="flex items-center gap-3 card p-4 cursor-pointer">
              <input type="radio" checked={metodoPago === 'efectivo'} onChange={() => setMetodoPago('efectivo')}/>
              <div>
                <span>Efectivo</span>
                <p className="text-xs text-tinta/50 mt-0.5">Retiro en local · Te confirmamos dirección por email</p>
              </div>
            </label>
          </div>
        </section>
      </div>

      <aside className="card p-6 h-fit sticky top-24">
        <h3 className="font-serif text-xl text-verde-900">Tu pedido</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productoId} className="flex justify-between">
              <span className="truncate mr-2">{i.nombre} × {i.cantidad}</span>
              <span>€{(i.precio * i.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-verde-200 flex justify-between font-semibold">
          <span>Total</span><span>€{total.toFixed(2)}</span>
        </div>
        {error && <p className="mt-4 text-sm text-terracota-400">{error}</p>}
        <button type="submit" disabled={procesando} className="btn-primary w-full mt-6 disabled:opacity-50">
          {procesando ? 'Procesando…' : 'Confirmar y pagar'}
        </button>
      </aside>
    </form>
  );
}
