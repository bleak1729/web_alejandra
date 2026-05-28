import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAuthStore, selectIsAdmin } from '../../store/authStore';
import { useCartStore, selectCartCount } from '../../store/cartStore';

const NAV = [
  { to: '/insumos',          label: 'Insumos' },
  { to: '/asesorias-cursos', label: 'Asesorías y Cursos' },
  { to: '/blog',             label: 'Blog' },
  { to: '/nosotros',         label: 'Nosotros' },
  { to: '/contacto',         label: 'Contacto' },
];

function IconBtn({ children, onClick, label, to }) {
  const cls = 'w-9 h-9 flex items-center justify-center rounded-lg border border-verde-200 text-tinta/70 hover:text-verde-700 hover:border-verde-400 transition-colors';
  if (to) return <Link to={to} className={cls} aria-label={label}>{children}</Link>;
  return <button onClick={onClick} className={cls} aria-label={label}>{children}</button>;
}

const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconCart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20.5 8H6"/>
    <circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>
  </svg>
);

export default function Header() {
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = useAuthStore(selectIsAdmin);
  const count    = useCartStore(selectCartCount);
  const nav      = useNavigate();

  const [searchOpen, setSearchOpen]   = useState(false);
  const [query2,     setQuery2]       = useState('');
  const [results,    setResults]      = useState([]);
  const [allProds,   setAllProds]     = useState(null); // caché local
  const inputRef = useRef(null);

  // Abrir/cerrar search con Escape
  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // Cargar productos una sola vez al abrir por primera vez
  async function openSearch() {
    setSearchOpen(true);
    if (allProds) return;
    try {
      const snap = await getDocs(query(collection(db, 'productos'), where('activo', '==', true)));
      setAllProds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { setAllProds([]); }
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery2('');
    setResults([]);
  }

  // Filtrar en cliente mientras escribe
  useEffect(() => {
    if (!query2.trim() || !allProds) { setResults([]); return; }
    const q = query2.toLowerCase();
    setResults(
      allProds
        .filter((p) => p.nombre?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q))
        .slice(0, 6)
    );
  }, [query2, allProds]);

  function handleSelect(id) {
    closeSearch();
    nav(`/producto/${id}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-verde-100/90 backdrop-blur border-b border-verde-200">
        <div className="container-app flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/LogoCircular1.png" alt="Vidacosmetic&mas logo" className="w-9 h-9 object-contain" />
            <span className="font-serif text-2xl text-verde-900">
              Vidacosmetic<span className="text-dorado-500">&amp;mas</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex gap-7 text-sm">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-verde-700' : 'text-tinta/70 hover:text-verde-700'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Iconos */}
          <div className="flex items-center gap-2">
            <IconBtn label="Buscar" onClick={openSearch}><IconSearch /></IconBtn>

            {user ? (
              <>
                <IconBtn label="Mi perfil" to="/perfil"><IconUser /></IconBtn>
                {isAdmin && (
                  <Link to="/admin" className="text-xs text-dorado-600 hover:text-dorado-500 px-2">Admin</Link>
                )}
                <button onClick={() => signOut(auth)} className="text-xs text-tinta/50 hover:text-tinta px-1">
                  Salir
                </button>
              </>
            ) : (
              <IconBtn label="Ingresar" to="/login"><IconUser /></IconBtn>
            )}

            <IconBtn label="Carrito" to="/carrito">
              <span className="relative">
                <IconCart />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-dorado-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                    {count}
                  </span>
                )}
              </span>
            </IconBtn>
          </div>
        </div>
      </header>

      {/* Overlay de búsqueda */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center pt-24 px-4"
          style={{ background: 'var(--overlay-medium)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-modal overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-crema-200">
              <IconSearch />
              <input
                ref={inputRef}
                value={query2}
                onChange={(e) => setQuery2(e.target.value)}
                placeholder="Buscar insumos, ácidos, ceras…"
                className="flex-1 text-base bg-transparent outline-none text-tinta placeholder:text-crema-400"
              />
              <button onClick={closeSearch} className="text-xl text-tinta/30 hover:text-tinta leading-none">×</button>
            </div>

            {/* Resultados */}
            {results.length > 0 && (
              <ul className="divide-y divide-crema-100 max-h-80 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelect(p.id)}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-verde-50 transition-colors text-left"
                    >
                      {p.imagenURL ? (
                        <img src={p.imagenURL} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-none" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-verde-100 flex-none" />
                      )}
                      <div className="min-w-0">
                        <p className="font-serif text-verde-900 truncate">{p.nombre}</p>
                        <p className="text-xs text-tinta/50">{p.categoria} · €{p.precio?.toFixed(2)}/{p.unidad}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query2.trim() && results.length === 0 && allProds && (
              <p className="px-5 py-6 text-sm text-tinta/50 text-center">
                Sin resultados para "<span className="italic">{query2}</span>"
              </p>
            )}

            {!query2.trim() && (
              <p className="px-5 py-5 text-sm text-tinta/40 text-center">Escribe para buscar productos</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
