import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-verde-900 text-crema-100 mt-20">
      <div className="container-app py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-2xl text-crema-50">
            Vidacosmetic<span className="text-dorado-400">&amp;mas</span>
          </h3>
          <p className="mt-3 text-sm text-crema-200/80 italic">"Belleza en un envase"</p>
          <p className="mt-4 text-xs text-crema-200/60">Desde 2018 — Insumos cosméticos con orientación profesional.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-dorado-400">Tienda</h4>
          <ul className="space-y-2 text-sm text-crema-200/80">
            <li><Link to="/insumos" className="hover:text-white">Catálogo</Link></li>
            <li><Link to="/asesorias-cursos" className="hover:text-white">Cursos y asesorías</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-dorado-400">Empresa</h4>
          <ul className="space-y-2 text-sm text-crema-200/80">
            <li><Link to="/nosotros" className="hover:text-white">Nosotros</Link></li>
            <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-dorado-400">Cuenta</h4>
          <ul className="space-y-2 text-sm text-crema-200/80">
            <li><Link to="/login" className="hover:text-white">Ingresar</Link></li>
            <li><Link to="/registro" className="hover:text-white">Crear cuenta</Link></li>
            <li><Link to="/perfil" className="hover:text-white">Mis pedidos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-verde-700/50 py-5 text-center text-xs text-crema-200/50">
        © {new Date().getFullYear()} Vidacosmetic&amp;mas — Preserva tu ingrediente más esencial.
      </div>
    </footer>
  );
}
