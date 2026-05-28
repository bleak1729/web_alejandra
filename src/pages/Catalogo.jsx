import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addToCart } from '../lib/cart';
import { useAuthStore } from '../store/authStore';
import ProductPlaceholder from '../components/catalog/ProductPlaceholder';

const TINTS = {
  acidos:    { from: '#e7d9c4', to: '#d8c4a5' },
  ceras:     { from: '#efe3d0', to: '#d9c8ad' },
  extractos: { from: '#c9d3b8', to: '#aab896' },
  aceites:   { from: '#e9d6a6', to: '#cdb37a' },
  envases:   { from: '#dad3c4', to: '#bdb4a2' },
  pigmentos: { from: '#d9bfae', to: '#b9967d' },
};
const DEFAULT_TINT = { from: '#dfe7d4', to: '#9bb586' };

const CAT_LABELS = {
  todos:     'Todos los insumos',
  acidos:    'Ácidos cosméticos',
  ceras:     'Ceras y emulsionantes',
  extractos: 'Extractos botánicos',
  aceites:   'Aceites y mantecas',
  envases:   'Envases y complementos',
  pigmentos: 'Pigmentos y colorantes',
};

const CAT_DESC = {
  todos:     'Materias primas e insumos para tu cosmética artesanal, con asesoría incluida.',
  acidos:    'Activos para exfoliación, hidratación y renovación celular.',
  ceras:     'Estructura, textura y estabilidad para cremas y bálsamos.',
  extractos: 'Concentrados vegetales para enriquecer tus fórmulas.',
  aceites:   'Bases nutritivas, vírgenes y prensadas en frío.',
  envases:   'Frascos, pipetas, etiquetas y herramientas.',
  pigmentos: 'Tonos minerales y vegetales aptos cosmético.',
};

function ProdImg({ producto }) {
  const tint = TINTS[producto.categoria] ?? DEFAULT_TINT;
  const sinStock = producto.stock <= 0;
  const ultimas = !sinStock && producto.stock <= (producto.stockMinimo ?? 0);

  if (producto.imagenURL) {
    return (
      <div className="aspect-square relative overflow-hidden">
        <img src={producto.imagenURL} alt={producto.nombre} loading="lazy" className="w-full h-full object-cover" />
        {sinStock && <span className="absolute top-2.5 left-2.5 bg-tinta text-white text-[11px] px-2 py-0.5 rounded-full">Sin stock</span>}
        {ultimas && <span className="absolute top-2.5 left-2.5 bg-rosa-500 text-white text-[11px] px-2 py-0.5 rounded-full">Últimas unidades</span>}
      </div>
    );
  }

  return (
    <div
      className="aspect-square relative overflow-hidden flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${tint.from}, ${tint.to})` }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0 12px,rgba(255,255,255,0.06) 12px 13px)' }} />
      <span className="font-serif italic text-4xl text-white/90 z-10">{producto.nombre?.[0]}</span>
      {sinStock && <span className="absolute top-2.5 left-2.5 bg-tinta text-white text-[11px] px-2 py-0.5 rounded-full z-20">Sin stock</span>}
      {ultimas && <span className="absolute top-2.5 left-2.5 bg-rosa-500 text-white text-[11px] px-2 py-0.5 rounded-full z-20">Últimas unidades</span>}
    </div>
  );
}

export default function Catalogo() {
  const { categoria } = useParams();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('relevance');
  const [maxPrecio, setMaxPrecio] = useState(100);
  const [soloStock, setSoloStock] = useState(false);
  const [added, setAdded] = useState({});

  const catActiva = categoria ?? 'todos';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const clauses = [where('activo', '==', true)];
        if (categoria) clauses.push(where('categoria', '==', categoria));
        const snap = await getDocs(query(collection(db, 'productos'), ...clauses));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.creadoEn?.seconds ?? 0) - (a.creadoEn?.seconds ?? 0));
        setProductos(docs);
      } catch (e) { console.warn('catalogo', e); setProductos([]); }
      setLoading(false);
    })();
  }, [categoria]);

  const filtrados = useMemo(() => {
    let items = [...productos];
    if (soloStock) items = items.filter((p) => p.stock > 0);
    items = items.filter((p) => p.precio <= maxPrecio);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      items = items.filter((p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q)
      );
    }
    if (orden === 'price-asc') items.sort((a, b) => a.precio - b.precio);
    if (orden === 'price-desc') items.sort((a, b) => b.precio - a.precio);
    if (orden === 'name') items.sort((a, b) => a.nombre?.localeCompare(b.nombre));
    return items;
  }, [productos, soloStock, maxPrecio, busqueda, orden]);

  async function handleAdd(e, producto) {
    e.preventDefault();
    if (!user) return nav('/login');
    if (producto.stock <= 0) return;
    await addToCart(producto, 1);
    setAdded((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [producto.id]: false })), 700);
  }

  const precioMax = productos.length ? Math.ceil(Math.max(...productos.map((p) => p.precio), 100)) : 100;

  return (
    <div className="container-app pb-16">

      {/* Breadcrumb */}
      <p className="text-sm text-tinta/50 pt-8">
        <Link to="/" className="hover:text-tinta transition">Inicio</Link>
        <span className="mx-2 opacity-50">/</span>
        <span>{CAT_LABELS[catActiva] ?? catActiva}</span>
      </p>

      {/* Header */}
      <header className="mt-4 mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-serif text-5xl text-verde-900 leading-tight">
            {CAT_LABELS[catActiva] ?? catActiva}
          </h1>
          <p className="text-tinta/60 mt-2 max-w-lg leading-relaxed">
            {CAT_DESC[catActiva] ?? ''}
          </p>
        </div>
        <span className="text-sm text-tinta/50">{filtrados.length} productos</span>
      </header>

      {/* Layout sidebar + main */}
      <div className="grid md:grid-cols-[220px_1fr] gap-8">

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-tinta/50 mb-3">Categorías</p>
            <ul className="space-y-2">
              {Object.entries(CAT_LABELS).map(([slug, label]) => (
                <li key={slug}>
                  <Link
                    to={slug === 'todos' ? '/insumos' : `/insumos/${slug}`}
                    className={`text-sm transition ${
                      catActiva === slug ? 'text-tinta font-medium' : 'text-tinta/60 hover:text-tinta'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-tinta/50 mb-3">
              Precio máx. <span className="normal-case font-normal text-tinta/40">— ${maxPrecio}</span>
            </p>
            <input
              type="range" min="1" max={precioMax} value={maxPrecio}
              onChange={(e) => setMaxPrecio(Number(e.target.value))}
              className="w-full accent-verde-700"
            />
            <div className="flex justify-between text-xs text-tinta/40 mt-1">
              <span>€1</span><span>€{precioMax}</span>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-tinta/70 cursor-pointer">
            <input type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} className="accent-verde-700" />
            Solo con stock
          </label>
        </aside>

        {/* Main */}
        <main>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="search"
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input flex-1 min-w-[180px] rounded-full"
            />
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="input rounded-full max-w-[200px]"
            >
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre A–Z</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <p className="text-center py-20 text-tinta/50">Cargando insumos…</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center py-20 text-tinta/50">No hay productos que coincidan.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtrados.map((p) => {
                const sinStock = p.stock <= 0;
                return (
                  <Link to={`/producto/${p.id}`} key={p.id} className="card group flex flex-col hover:-translate-y-1 transition-transform duration-200">
                    <ProdImg producto={p} />
                    <div className="p-3 flex flex-col flex-1 gap-1">
                      <h3 className="font-serif text-lg text-verde-900 leading-snug line-clamp-2">{p.nombre}</h3>
                      {p.descripcion && (
                        <p className="text-xs text-tinta/50 font-mono line-clamp-1">{p.descripcion}</p>
                      )}
                      <div className="flex items-end justify-between mt-auto pt-2">
                        <div>
                          <p className="font-medium text-tinta">€{p.precio?.toFixed(2)}</p>
                          <p className="text-xs text-tinta/50">{p.unidad}</p>
                        </div>
                        <button
                          onClick={(e) => handleAdd(e, p)}
                          disabled={sinStock}
                          aria-label={sinStock ? 'Sin stock' : 'Agregar al carrito'}
                          className="w-9 h-9 rounded-full bg-verde-600 text-white text-lg flex items-center justify-center hover:bg-verde-700 disabled:bg-tinta/30 disabled:cursor-not-allowed transition-colors"
                        >
                          {sinStock ? '×' : added[p.id] ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
