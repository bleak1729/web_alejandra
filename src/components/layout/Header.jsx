import { Link, NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore, selectIsAdmin } from '../../store/authStore';
import { useCartStore, selectCartCount } from '../../store/cartStore';

const nav = [
  { to: '/insumos', label: 'Insumos' },
  { to: '/asesorias-cursos', label: 'Asesorías y Cursos' },
  { to: '/blog', label: 'Blog' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore(selectIsAdmin);
  const count = useCartStore(selectCartCount);

  return (
    <header className="sticky top-0 z-40 bg-crema-50/85 backdrop-blur border-b border-crema-200">
      <div className="container-app flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/LogoCircular1.png" alt="Vidacosmetic&mas logo" className="w-9 h-9 object-contain" />
          <span className="font-serif text-2xl text-verde-900">
            Vidacosmetic<span className="text-dorado-500">&amp;mas</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-7 text-sm">
          {nav.map((n) => (
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

        <div className="flex items-center gap-3">
          <Link to="/carrito" className="relative p-2 hover:text-verde-700" aria-label="Carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20.5 8H6"/>
              <circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-dorado-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/perfil" className="text-sm hover:text-verde-700 hidden sm:inline">Perfil</Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-dorado-600 hover:text-dorado-500 hidden sm:inline">
                  Admin
                </Link>
              )}
              <button onClick={() => signOut(auth)} className="text-sm text-tinta/60 hover:text-tinta">
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Ingresar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
