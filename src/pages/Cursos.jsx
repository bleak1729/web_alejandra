import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GRADIENTES = [
  { from: '#dfe7d4', to: '#6f8a5e' },
  { from: '#efe3d0', to: '#c9a96e' },
  { from: '#e8d3c6', to: '#b9967d' },
  { from: '#dad3c4', to: '#9b9180' },
  { from: '#d4e0f0', to: '#6f8aaa' },
  { from: '#f0d4e8', to: '#aa6f8a' },
];

const pasos = [
  { num: '1', titulo: 'Reserva tu plaza', desc: 'Selecciona el curso o la asesoría y elige fecha. Plazas limitadas a 8 personas.' },
  { num: '2', titulo: 'Recibe el kit', desc: 'Materiales, fichas técnicas y guion de la sesión te llegan por email 48 h antes.' },
  { num: '3', titulo: 'Acompañamiento', desc: 'Tras la sesión tienes 30 días de soporte por email para cualquier duda.' },
];

function ImgPlaceholder({ from, to, glyph }) {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center min-h-[220px]"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0 12px,rgba(255,255,255,0.06) 12px 13px)' }}
      />
      <span className="font-serif italic text-5xl text-white/90 z-10">{glyph}</span>
    </div>
  );
}

export default function Cursos() {
  const nav = useNavigate();
  const [filtro, setFiltro] = useState('todos');
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  function reservar(curso) {
    nav('/contacto', {
      state: {
        asunto: 'Curso o taller',
        mensaje: `Hola, me interesa reservar plaza para: ${curso.titulo}.\n\nPor favor, indícame disponibilidad y próximas fechas.`,
      },
    });
  }

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'cursos_asesorias'), orderBy('creadoEn', 'desc')));
        const docs = snap.docs.map((d, i) => {
          const data = { id: d.id, ...d.data() };
          return {
            ...data,
            gradiente: GRADIENTES[i % GRADIENTES.length],
            glyph: data.titulo?.[0]?.toUpperCase() ?? '✦',
          };
        });
        setCursos(docs);
      } catch (e) { console.warn('cursos', e); }
      setLoading(false);
    })();
  }, []);

  const filtrados = filtro === 'todos' ? cursos : cursos.filter((c) => c.tipo === filtro);

  return (
    <div className="container-app pb-20">

      {/* Breadcrumb */}
      <p className="text-sm text-tinta/50 pt-8">
        <Link to="/" className="hover:text-tinta transition">Inicio</Link>
        <span className="mx-2 opacity-50">/</span>
        <span>Asesorías y cursos</span>
      </p>

      {/* Header */}
      <header className="mt-6 mb-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-medium text-verde-700">Aprende con nosotras</p>
          <h1 className="font-serif text-5xl md:text-6xl text-verde-900 leading-tight mt-2">
            Cursos en vivo <span className="italic">y</span> asesorías a medida
          </h1>
        </div>
        <p className="text-tinta/60 leading-relaxed">
          Plazas reducidas, materiales incluidos y seguimiento posterior. Diseñados por Lucía Vidal,
          formuladora cosmética y fundadora de la marca.
        </p>
      </header>

      {/* Filtros */}
      <div className="flex gap-2 mb-8">
        {[['todos', 'Todos'], ['curso', 'Cursos'], ['asesoria', 'Asesorías']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltro(val)}
            className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
              filtro === val
                ? 'bg-verde-600 text-white border-verde-600'
                : 'border-tinta/15 text-tinta hover:border-tinta'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid cursos */}
      {loading && <p className="text-center py-20 text-tinta/50">Cargando…</p>}
      {!loading && filtrados.length === 0 && (
        <p className="text-center py-20 text-tinta/50">No hay resultados en esta categoría.</p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {filtrados.map((c) => (
          <article key={c.id} className="card overflow-hidden grid grid-cols-[1fr_1.4fr] hover:-translate-y-1 transition-transform duration-200">
            <ImgPlaceholder from={c.gradiente.from} to={c.gradiente.to} glyph={c.glyph} />
            <div className="p-6 flex flex-col">
              <div className="flex gap-2 mb-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.1em] bg-verde-100 text-verde-700">
                  {c.tipo === 'asesoria' ? 'Asesoría 1:1' : 'Curso'}
                </span>
                {c.proximamente && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.1em] bg-terracota-100 text-terracota-400">
                    Próxima edición
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl text-verde-900 leading-snug">{c.titulo}</h3>
              <p className="text-sm text-tinta/60 leading-relaxed mt-2">{c.descripcion}</p>
              <p className="text-xs text-tinta/40 mt-2">{c.duracion}</p>
              <div className="flex items-center gap-3 mt-auto pt-4">
                <span className="font-serif text-2xl text-verde-900">{c.precio} €</span>
                <button
                  onClick={() => reservar(c)}
                  className={`ml-auto text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                    c.disponible
                      ? 'bg-verde-600 text-white border-verde-600 hover:bg-verde-700'
                      : 'border-verde-600 text-verde-700 hover:bg-verde-50'
                  }`}
                >
                  {c.disponible ? 'Reservar plaza →' : 'Avisarme →'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Cómo funciona */}
      <section className="mt-16 bg-white border border-tinta/10 rounded-2xl p-10">
        <h2 className="font-serif text-3xl text-verde-900 text-center mb-10">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {pasos.map((p) => (
            <div key={p.num} className="text-center">
              <div className="w-11 h-11 rounded-full bg-verde-100 text-verde-700 font-serif text-xl inline-flex items-center justify-center mb-3">
                {p.num}
              </div>
              <h4 className="font-medium text-tinta mb-2">{p.titulo}</h4>
              <p className="text-sm text-tinta/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 bg-verde-100 rounded-2xl p-10 text-center">
        <h3 className="font-serif text-3xl text-verde-900 mb-2">¿No encuentras lo que necesitas?</h3>
        <p className="text-tinta/60 mb-6">Diseñamos formaciones a medida para grupos y empresas.</p>
        <Link to="/contacto" className="btn-primary">Cuéntanos tu caso →</Link>
      </section>

    </div>
  );
}
