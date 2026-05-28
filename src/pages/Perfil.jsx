import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export default function Perfil() {
  const { user, profile } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);
  const [direccion, setDireccion] = useState(profile?.direccion ?? { calle: '', ciudad: '', pais: '', codigoPostal: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'pedidos'),
          where('usuarioId', '==', user.uid),
          orderBy('creadoEn', 'desc'),
        );
        const snap = await getDocs(q);
        setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.warn(e); }
    })();
  }, [user]);

  async function guardar(e) {
    e.preventDefault();
    await updateDoc(doc(db, 'usuarios', user.uid), { direccion });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="container-app py-12 grid md:grid-cols-3 gap-10">
      <aside className="md:col-span-1">
        <h1 className="font-serif text-3xl text-verde-900">Hola, {profile?.nombre || 'cliente'}</h1>
        <p className="text-tinta/60 mt-1">{profile?.email}</p>
        <form onSubmit={guardar} className="card p-6 mt-6 space-y-3">
          <h3 className="font-serif text-lg text-verde-900">Dirección</h3>
          <div><label className="label">Calle</label>
            <input className="input" value={direccion.calle} onChange={(e) => setDireccion({...direccion, calle: e.target.value})}/>
          </div>
          <div><label className="label">Ciudad</label>
            <input className="input" value={direccion.ciudad} onChange={(e) => setDireccion({...direccion, ciudad: e.target.value})}/>
          </div>
          <div><label className="label">País</label>
            <input className="input" value={direccion.pais} onChange={(e) => setDireccion({...direccion, pais: e.target.value})}/>
          </div>
          <div><label className="label">Código postal</label>
            <input className="input" value={direccion.codigoPostal} onChange={(e) => setDireccion({...direccion, codigoPostal: e.target.value})}/>
          </div>
          <button className="btn-primary w-full">Guardar</button>
          {saved && <p className="text-verde-700 text-sm text-center">Guardado ✓</p>}
        </form>
      </aside>

      <section className="md:col-span-2">
        <h2 className="font-serif text-2xl text-verde-900 mb-4">Mis pedidos</h2>
        {pedidos.length === 0 ? (
          <p className="text-tinta/60">Aún no has hecho pedidos.</p>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p) => (
              <article key={p.id} className="card p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-mono text-xs text-tinta/50">{p.id}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.estado === 'entregado' ? 'bg-verde-100 text-verde-700' :
                    p.estado === 'cancelado' ? 'bg-terracota-100 text-terracota-400' :
                    'bg-verde-100 text-verde-700'
                  }`}>{p.estado}</span>
                </div>
                <p className="mt-2 text-sm">{p.items?.length} productos · <strong>€{p.total?.toFixed(2)}</strong></p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
