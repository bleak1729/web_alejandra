import { useState } from 'react';
import { Link } from 'react-router-dom';

const featured = {
  categoria: 'Formulación',
  titulo: 'Cómo elegir el conservante adecuado para tu fórmula',
  resumen: 'Un mapa práctico entre cosmos-aptos, broad-spectrum y opciones para baños y aceites.',
  autor: 'Lucía Vidal',
  fecha: '12 mayo 2026',
  lectura: '6 min lectura',
  gradiente: { from: '#e8d3c6', to: '#b9967d' },
  glyph: 'Activos',
};

const articulos = [
  {
    id: 1,
    categoria: 'Activos',
    titulo: 'Ácido hialurónico: bajo, medio y alto peso molecular',
    resumen: 'Cuál usar según la capa de la piel que quieras hidratar y por qué la mezcla es la respuesta.',
    fecha: '28 abril 2026',
    lectura: '8 min',
    gradiente: { from: '#dfe7d4', to: '#9bb586' },
    glyph: 'A',
  },
  {
    id: 2,
    categoria: 'Regulación',
    titulo: 'Etiquetado cosmético en Europa: lo mínimo que debes saber',
    resumen: 'INCI, lote, PAO, dirección del responsable. Una checklist antes de salir al mercado.',
    fecha: '14 abril 2026',
    lectura: '5 min',
    gradiente: { from: '#efe3d0', to: '#c9a96e' },
    glyph: 'R',
  },
  {
    id: 3,
    categoria: 'Recetas',
    titulo: 'Tu primer sérum: receta paso a paso',
    resumen: 'Un sérum de niacinamida al 5% explicado fase por fase, con todas las dosificaciones.',
    fecha: '2 abril 2026',
    lectura: '10 min',
    gradiente: { from: '#dad3c4', to: '#9b9180' },
    glyph: 'R',
  },
];

function ImgPlaceholder({ from, to, glyph, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0 12px,rgba(255,255,255,0.06) 12px 13px)' }}
      />
      <span className="font-serif italic text-4xl text-white/90 z-10">{glyph}</span>
    </div>
  );
}

export default function Blog() {
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);

  function handleNewsletter(e) {
    e.preventDefault();
    setSuscrito(true);
    setEmail('');
  }

  return (
    <div className="container-app pb-20">

      {/* Breadcrumb */}
      <p className="text-sm text-tinta/50 pt-8">
        <Link to="/" className="hover:text-tinta transition">Inicio</Link>
        <span className="mx-2 opacity-50">/</span>
        <span>Blog</span>
      </p>

      {/* Header */}
      <header className="mt-6 mb-12">
        <p className="text-xs uppercase tracking-[0.22em] font-medium text-verde-700">Diario de formulación</p>
        <h1 className="font-serif text-5xl md:text-6xl text-verde-900 leading-tight mt-2">
          Recetas, activos y <span className="italic">criterios</span> para formular mejor.
        </h1>
      </header>

      {/* Featured */}
      <article className="grid md:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-center">
        <ImgPlaceholder
          from={featured.gradiente.from}
          to={featured.gradiente.to}
          glyph={featured.glyph}
          className="aspect-[4/3] rounded-2xl"
        />
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs uppercase tracking-[0.1em] bg-crema-100 text-tinta/60">
            {featured.categoria}
          </span>
          <h2 className="font-serif text-4xl text-verde-900 leading-snug mt-3 mb-4">
            {featured.titulo}
          </h2>
          <p className="text-tinta/60 leading-relaxed">{featured.resumen}</p>
          <p className="text-xs text-tinta/40 mt-4">
            {featured.autor} · {featured.fecha} · {featured.lectura}
          </p>
          <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-tinta/20 text-sm text-tinta hover:bg-tinta hover:text-crema-50 transition-all duration-200">
            Leer artículo →
          </button>
        </div>
      </article>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {articulos.map((a) => (
          <article key={a.id} className="card flex flex-col hover:-translate-y-1 transition-transform duration-200">
            <ImgPlaceholder
              from={a.gradiente.from}
              to={a.gradiente.to}
              glyph={a.glyph}
              className="aspect-[16/10]"
            />
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[11px] uppercase tracking-[0.1em] text-tinta/50">{a.categoria}</p>
              <h3 className="font-serif text-xl text-verde-900 leading-snug mt-1">{a.titulo}</h3>
              <p className="text-sm text-tinta/60 leading-relaxed mt-2">{a.resumen}</p>
              <p className="text-xs text-tinta/40 mt-auto pt-4">{a.fecha} · {a.lectura}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter */}
      <section className="mt-20 bg-verde-100 rounded-2xl p-10 text-center">
        <h3 className="font-serif text-3xl text-verde-900 mb-2">Recibe la receta del mes</h3>
        <p className="text-tinta/60 mb-6">Una fórmula nueva, probada y explicada, cada cuatro semanas. Sin spam.</p>
        {suscrito ? (
          <p className="text-verde-700 font-medium">¡Te has suscrito!</p>
        ) : (
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input flex-1 rounded-full"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Suscribirme</button>
          </form>
        )}
      </section>

    </div>
  );
}
