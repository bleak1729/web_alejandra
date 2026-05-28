import { Link } from 'react-router-dom';
import { addToCart } from '../../lib/cart';
import ProductPlaceholder from './ProductPlaceholder';

export default function ProductCard({ producto }) {
  const sinStock = producto.stock <= 0;
  const ultimas = !sinStock && producto.stock <= (producto.stockMinimo ?? 0);

  async function handleAdd(e) {
    e.preventDefault();
    if (sinStock) return;
    await addToCart(producto, 1);
  }

  return (
    <Link to={`/producto/${producto.id}`} className="card group block">
      <div className="aspect-square bg-crema-100 overflow-hidden relative">
        {producto.imagenURL ? (
          <img
            src={producto.imagenURL}
            alt={producto.nombre}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder nombre={producto.nombre} categoria={producto.categoria} />
        )}
        {sinStock && (
          <span className="absolute top-3 left-3 bg-tinta/80 text-white text-xs px-2 py-1 rounded-full">
            Sin stock
          </span>
        )}
        {ultimas && (
          <span className="absolute top-3 left-3 bg-dorado-500 text-white text-xs px-2 py-1 rounded-full">
            Últimas unidades
          </span>
        )}
        {producto.destacado && !sinStock && !ultimas && (
          <span className="absolute top-3 right-3 bg-verde-700 text-white text-xs px-2 py-1 rounded-full">
            Destacado
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-tinta/50">{producto.categoria}</p>
        <h3 className="mt-1 font-serif text-lg text-verde-900 line-clamp-1">{producto.nombre}</h3>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-semibold text-tinta">€{producto.precio?.toFixed(2)}</span>
            <span className="text-xs text-tinta/50 ml-1">/{producto.unidad}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={sinStock}
            className="text-xs btn-primary py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </Link>
  );
}
