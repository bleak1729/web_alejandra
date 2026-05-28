import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Confirmacion from './pages/Confirmacion';
import Cursos from './pages/Cursos';
import Blog from './pages/Blog';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProductos from './pages/admin/Productos';
import AdminStock from './pages/admin/Stock';
import AdminPedidos from './pages/admin/Pedidos';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminCategorias from './pages/admin/Categorias';
import AdminCursos from './pages/admin/Cursos';
import AdminEmpresa from './pages/admin/Empresa';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/insumos" element={<Catalogo />} />
        <Route path="/insumos/:categoria" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/asesorias-cursos" element={<Cursos />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<RequireAuth />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacion/:pedidoId" element={<Confirmacion />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="cursos" element={<AdminCursos />} />
          <Route path="empresa" element={<AdminEmpresa />} />
        </Route>
      </Route>
    </Routes>
  );
}
