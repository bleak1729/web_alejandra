import { NavLink, Outlet, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/admin',            label: 'Dashboard',  end: true, ic: '▤' },
  { to: '/admin/productos',  label: 'Productos',            ic: '▣' },
  { to: '/admin/stock',      label: 'Stock',                ic: '▦' },
  { to: '/admin/pedidos',    label: 'Pedidos',              ic: '⛟' },
  { to: '/admin/usuarios',   label: 'Usuarios',             ic: '☻' },
  { to: '/admin/categorias', label: 'Categorías',           ic: '⌗' },
  { to: '/admin/cursos',     label: 'Cursos',               ic: '✎' },
];

export default function AdminLayout() {
  const profile = useAuthStore((s) => s.profile);
  const user    = useAuthStore((s) => s.user);

  const nombre = profile?.nombre ?? user?.email ?? 'Admin';
  const email  = user?.email ?? '';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', background: '#1c1d18', color: '#ece7d8' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '1.6rem 1.2rem',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', color: 'inherit', textDecoration: 'none' }}>
          <img src="/LogoCircular1.png" alt="" style={{ width: 22, height: 22, borderRadius: '999px', objectFit: 'cover' }} />
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem' }}>
            vida<span style={{ color: '#d6b97e', fontStyle: 'italic' }}>&amp;</span>cosmetic
          </span>
        </Link>

        <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '0.8rem' }}>
          Administración
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {links.map(({ to, label, end, ic }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 0.8rem', borderRadius: '8px',
                border: 'none', textDecoration: 'none',
                fontSize: '0.85rem', cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive ? '#ece7d8' : 'rgba(236,231,216,0.7)',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              <span style={{ width: 18, textAlign: 'center', opacity: 0.8 }}>{ic}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#ece7d8' }}>{nombre}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{email}</div>
          <button
            onClick={() => signOut(auth)}
            style={{
              marginTop: '0.7rem', padding: '0.5rem 0.8rem',
              background: 'transparent', color: 'rgba(236,231,216,0.7)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px',
              width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
            }}
          >
            ↩ Salir
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ padding: '2rem 2.5rem 3rem', minWidth: 0, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
