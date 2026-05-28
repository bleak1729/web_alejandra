import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Confirmacion() {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'pedidos', pedidoId));
      if (snap.exists()) setPedido({ id: snap.id, ...snap.data() });
    })();
  }, [pedidoId]);

  return (
    <div className="container-app py-20 max-w-2xl text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-verde-100 flex items-center justify-center text-verde-700 text-3xl">✓</div>
      <h1 className="font-serif text-4xl text-verde-900 mt-6">¡Gracias por tu compra!</h1>
      <p className="text-tinta/60 mt-2">Tu pedido <span className="font-mono">{pedidoId}</span> está confirmado.</p>
      {pedido && (
        <div className="card mt-8 p-6 text-left">
          <p className="text-sm text-tinta/60">Estado: <span className="text-verde-700">{pedido.estado}</span></p>
          <p className="mt-2 text-sm">Total: <span className="font-semibold">€{pedido.total?.toFixed(2)}</span></p>
          <ul className="mt-4 space-y-1 text-sm">
            {pedido.items?.map((i) => (
              <li key={i.productoId} className="flex justify-between">
                <span>{i.nombre} × {i.cantidad}</span><span>€{i.subtotal?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link to="/insumos" className="btn-primary mt-8 inline-flex">Seguir comprando</Link>
    </div>
  );
}
