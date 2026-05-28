import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function RequireAdmin() {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <div className="p-12 text-center text-tinta/60">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.rol !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
