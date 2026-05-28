import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addToCart } from '../lib/cart';
import { useAuthStore } from '../store/authStore';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'productos', id));
        if (snap.exists()) setP({ id: snap.id, ...snap.data() });
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="container-app py-20 text-center text-tinta/60">Cargando…</div>;
  if (!p) return <div className="container-app py-20 text-center">Producto no encontrado. <Link className="underline" to="/insumos">Volver</Link></div>;

  const sinStock = p.stock <= 0;
  const ultimas = !sinStock && p.stock <= (p.stockMinimo ?? 0);

  async function handleAdd() {
    if (!user) return nav('/login');
    await addToCart(p, cantidad);
    nav('/carrito');
  }

  return (
    <div className="container-app py-12 grid md:grid-cols-2 gap-12">
      <div className="card aspect-square overflow-hidden">
        {p.imagenURL ? (
          <img src={p.imagenURL} alt={p.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-crema-100 flex items-center justify-center text-crema-300 font-serif text-6xl">
            V<span className="text-dorado-400">&amp;</span>m
          </div>
        )}
      </div>
      <div>
        <p className="text-dorado-600 text-xs uppercase tracking-[0.2em]">{p.categoria}</p>
        <h1 className="font-serif text-4xl text-verde-900 mt-2">{p.nombre}</h1>
        <p className="mt-4 text-3xl font-semibold text-tinta">${p.precio?.toFixed(2)}
          <span className="text-base text-tinta/50 ml-1">/{p.unidad}</span>
        </p>
        <p className="mt-6 text-tinta/70 leading-relaxed">{p.descripcion}</p>

        {sinStock && <p className="mt-6 text-rosa-500">Actualmente sin stock</p>}
        {ultimas && <p className="mt-6 text-dorado-600">¡Últimas {p.stock} unidades!</p>}

        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center border border-crema-200 rounded-full">
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-9 h-9">−</button>
            <span className="w-10 text-center">{cantidad}</span>
            <button onClick={() => setCantidad(Math.min(p.stock || 99, cantidad + 1))} className="w-9 h-9">+</button>
          </div>
          <button onClick={handleAdd} disabled={sinStock} className="btn-primary disabled:opacity-40">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
