import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useGuestStore } from '../../store/guestStore';

export default function RequireAuth() {
  const { user, loading } = useAuthStore();
  const guest = useGuestStore((s) => s.guest);
  const loc = useLocation();
  if (loading) return <div className="p-12 text-center text-tinta/60">Cargando…</div>;
  if (!user && !guest) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
