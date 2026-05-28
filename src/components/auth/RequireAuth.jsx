import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function RequireAuth() {
  const { user, loading } = useAuthStore();
  const loc = useLocation();
  if (loading) return <div className="p-12 text-center text-tinta/60">Cargando…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
