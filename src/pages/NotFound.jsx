import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-app py-32 text-center">
      <p className="font-serif text-7xl text-dorado-500">404</p>
      <h1 className="font-serif text-3xl text-verde-900 mt-4">Página no encontrada</h1>
      <Link to="/" className="btn-primary mt-6 inline-flex">Volver al inicio</Link>
    </div>
  );
}
