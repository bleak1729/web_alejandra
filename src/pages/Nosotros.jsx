import { Link } from 'react-router-dom';
import historiaImg from '../../imagenes/historia.jpeg';

const timeline = [
  { year: '2018', text: 'Nace en un piso de Lavapiés con 12 referencias.' },
  { year: '2020', text: 'Abrimos el taller físico y empezamos las asesorías.' },
  { year: '2023', text: 'Más de 1.000 formuladoras nos han hecho su primer pedido.' },
  { year: '2026', text: 'Lanzamos nuestra tienda online con asesoría incluida.' },
];

export default function Nosotros() {
  return (
    <div className="container-app py-10">

      {/* Breadcrumb */}
      <p className="text-sm text-tinta/50">
        <Link to="/" className="hover:text-tinta transition">Inicio</Link>
        <span className="mx-2 opacity-50">/</span>
        <span>Nosotros</span>
      </p>

      {/* Hero texto */}
      <section className="text-center mt-10 mb-10">
        <p className="text-xs uppercase tracking-[0.22em] font-medium text-verde-700">
          Nuestra historia · 2018 → hoy
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-verde-900 leading-tight mt-3 mb-5">
          Belleza en un envase,<br />
          <span className="italic">criada en Madrid.</span>
        </h1>
        <p className="text-tinta/60 max-w-xl mx-auto leading-relaxed">
          Vidacosmetic&amp;mas nació en 2018 con una intención clara: hacer accesible la
          cosmética que de verdad funciona, sin esconder lo que va dentro. Desde entonces
          acompañamos a quien empieza y a quien ya vive de formular.
        </p>
      </section>

      {/* Hero imagen placeholder */}
      <div className="w-full rounded-2xl overflow-hidden aspect-[16/8] relative">
        <img
          src={historiaImg}
          alt="Nuestro taller"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dos columnas */}
      <div className="grid md:grid-cols-2 gap-12 mt-14">
        <div>
          <h2 className="font-serif text-3xl text-verde-900 mb-4">Lo que nos guía</h2>
          <p className="text-tinta/60 leading-relaxed">
            Brindar los mejores insumos cosméticos con orientación profesional para que cada
            cliente, sea aficionada o laboratorio pequeño, compre lo que realmente necesita.
            No vendemos por vender: si una materia no es para ti, te lo decimos.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl text-verde-900 mb-4">Lo que nos diferencia</h2>
          <ul className="text-tinta/60 leading-loose list-disc list-inside space-y-1">
            <li>Cada lote llega con su ficha técnica y de seguridad.</li>
            <li>Asesoría gratuita por email a cualquier persona registrada.</li>
            <li>Cursos en vivo con plazas reducidas, no clases pregrabadas.</li>
            <li>Envasamos en pequeñas cantidades para que pruebes sin desperdicio.</li>
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-tinta/10" />
          <span className="text-xs uppercase tracking-[0.22em] text-tinta/50 font-medium">línea del tiempo</span>
          <div className="flex-1 h-px bg-tinta/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {timeline.map(({ year, text }) => (
            <div key={year} className="card p-5 hover:-translate-y-1 transition-transform duration-200">
              <p className="font-serif text-4xl text-verde-700 leading-none">{year}</p>
              <p className="text-tinta/60 text-sm leading-relaxed mt-3">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 mb-4 bg-crema-100 rounded-2xl p-10 text-center">
        <h3 className="font-serif text-3xl text-verde-900 mb-3">¿Empezamos juntas tu fórmula?</h3>
        <p className="text-tinta/60 mb-6">Una sesión 1:1 de 60 minutos para revisar tu receta, etiquetado o producción.</p>
        <Link to="/asesorias-cursos" className="btn-primary">Reservar asesoría →</Link>
      </section>

    </div>
  );
}
