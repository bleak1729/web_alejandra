import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addToCart } from '../lib/cart';

/* ── Paleta teal (design system) ── */
const P = {
  bg:       '#eef5f3',   // verde-50
  bgSoft:   '#dcebe8',   // verde-100
  deep:     '#327069',   // verde-600
  tint:     '#dcebe8',   // verde-100
  ink:      '#1d1b17',   // tinta
  inkSoft:  '#665f52',   // crema-600
};

const CATEGORIAS = [
  { slug: 'acidos',    num: '01', label: 'Ácidos cosméticos',      t1: '#dfe7d4', t2: '#9bb586' },
  { slug: 'ceras',     num: '02', label: 'Ceras y emulsionantes',   t1: '#efe3d0', t2: '#c9a96e' },
  { slug: 'extractos', num: '03', label: 'Extractos botánicos',     t1: '#e8d3c6', t2: '#b9967d' },
  { slug: 'aceites',   num: '04', label: 'Aceites y mantecas',      t1: '#dad3c4', t2: '#9b9180' },
  { slug: 'envases',   num: '05', label: 'Envases y complementos',  t1: '#c9d3b8', t2: '#6f8a5e' },
  { slug: 'pigmentos', num: '06', label: 'Pigmentos y colorantes',  t1: '#f0e2c9', t2: '#cdb37a' },
];

const TINTS = {
  acidos:    { t1: '#e7d9c4', t2: '#d8c4a5' },
  ceras:     { t1: '#efe3d0', t2: '#d9c8ad' },
  extractos: { t1: '#c9d3b8', t2: '#aab896' },
  aceites:   { t1: '#e9d6a6', t2: '#cdb37a' },
  envases:   { t1: '#dad3c4', t2: '#bdb4a2' },
  pigmentos: { t1: '#d9bfae', t2: '#b9967d' },
  default:   { t1: '#dfe7d4', t2: '#9bb586' },
};

const TRUST_ICONS = {
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M11 20A7 7 0 0 1 4 13c0-5.25 5-10 9-10 0 5-1 9-5 13"/><path d="M4 13c4-2 7-4 9-10"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  mortarboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 22 8.5 12 15 2 8.5"/><path d="M6 11.5v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><line x1="22" y1="8.5" x2="22" y2="14"/>
    </svg>
  ),
};

const TRUST = [
  { icon: 'truck',       t: 'Envío gratis +50€',  s: 'Península 24–48h' },
  { icon: 'leaf',        t: 'Materias primas BIO', s: 'Trazabilidad completa' },
  { icon: 'shield',      t: 'Calidad cosmética',   s: 'Lotes y fichas técnicas' },
  { icon: 'mortarboard', t: 'Asesoría incluida',   s: 'Te orientamos por email' },
];

const CURSOS_STATIC = [
  { tipo: 'Curso',        titulo: 'Formulación de Cremas Hidratantes', dur: '4 sesiones · 8 h',  precio: '89,00 €' },
  { tipo: 'Asesoría 1:1', titulo: 'Asesoría Personalizada 1:1',        dur: '60 min · online',   precio: '45,00 €' },
  { tipo: 'Curso',        titulo: 'Jabones Naturales en Frío',          dur: '3 sesiones · 6 h',  precio: '65,00 €' },
  { tipo: 'Curso',        titulo: 'Cosmética Capilar Avanzada',         dur: '5 sesiones · 10 h', precio: '110,00 €' },
];

function BtnPrimary({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 px-6 py-3 rounded-full text-sm font-medium text-white transition-all duration-200"
      style={{ background: '#327069' }}
      onMouseEnter={e => e.currentTarget.style.background = '#27595a'}
      onMouseLeave={e => e.currentTarget.style.background = '#327069'}
    >
      {children}
    </Link>
  );
}

function BtnGhost({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 px-6 py-3 rounded-full border text-sm text-tinta transition-all duration-200 hover:bg-tinta hover:text-crema-50"
      style={{ borderColor: 'rgba(42,40,32,0.2)' }}
    >
      {children}
    </Link>
  );
}

function ProdCard({ producto, onAdd, added }) {
  const tint = TINTS[producto.categoria] ?? TINTS.default;
  const sinStock = producto.stock <= 0;
  return (
    <Link
      to={`/producto/${producto.id}`}
      className="bg-white border border-tinta/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_38px_rgba(0,0,0,0.06)]"
    >
      {producto.imagenURL ? (
        <img src={producto.imagenURL} alt={producto.nombre} className="aspect-square w-full object-cover" />
      ) : (
        <div
          className="aspect-square relative overflow-hidden flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${tint.t1}, ${tint.t2})` }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0 12px,rgba(255,255,255,0.06) 12px 13px)' }} />
          <span className="font-serif italic text-[2.4rem] text-white/90 z-10">{producto.nombre?.[0]}</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <h3 className="font-serif font-medium text-[1.15rem] leading-[1.2] m-0 line-clamp-2" style={{ color: P.ink }}>{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="font-mono text-[0.74rem] line-clamp-1" style={{ color: P.inkSoft }}>{producto.descripcion}</p>
        )}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <p className="font-medium" style={{ color: P.ink }}>€{producto.precio?.toFixed(2)}</p>
            <p className="text-[0.72rem]" style={{ color: P.inkSoft }}>{producto.unidad}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onAdd(producto); }}
            disabled={sinStock}
            className="w-9 h-9 rounded-full text-white text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ background: sinStock ? '#ccc' : '#327069' }}
            onMouseEnter={e => { if (!sinStock) e.currentTarget.style.background = '#27595a'; }}
            onMouseLeave={e => { if (!sinStock) e.currentTarget.style.background = '#327069'; }}
          >
            {sinStock ? '×' : added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [added, setAdded] = useState({});
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSent, setNewsSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'productos'), where('activo', '==', true), where('destacado', '==', true), limit(8));
        const snap = await getDocs(q);
        setDestacados(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.warn('destacados', e); }
    })();
  }, []);

  async function handleAdd(producto) {
    if (producto.stock <= 0) return;
    await addToCart(producto, 1);
    setAdded((p) => ({ ...p, [producto.id]: true }));
    setTimeout(() => setAdded((p) => ({ ...p, [producto.id]: false })), 700);
  }

  function handleNews(e) {
    e.preventDefault();
    setNewsSent(true);
    setNewsEmail('');
  }

  return (
    <>
      {/* ── HERO GIF ── */}
      <section className="relative overflow-hidden border-b border-tinta/10">
        {/* GIF determina la altura naturalmente según su proporción */}
        <img
          src="/Banner2.gif"
          alt="Vidacosmetic&mas"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(238,245,243,0.45) 0%, rgba(238,245,243,0.35) 60%, rgba(238,245,243,0.60) 100%)',
        }} />

        {/* Botones al fondo del hero */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: 0, right: 0,
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem',
          padding: '0 1rem', zIndex: 10,
        }}>
          <BtnPrimary to="/insumos">Explorar insumos →</BtnPrimary>
          <BtnGhost to="/asesorias-cursos">Reservar asesoría</BtnGhost>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="border-y border-verde-200/60" style={{ background: '#dcebe8' }}>
        <div className="container-app grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
          {TRUST.map(({ icon, t, s }) => (
            <div key={t} className="flex gap-3 items-start">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-none shadow-sm bg-white"
                style={{ color: '#327069' }}
              >
                {TRUST_ICONS[icon]}
              </div>
              <div>
                <p className="text-[0.85rem] font-medium" style={{ color: P.ink }}>{t}</p>
                <p className="text-[0.75rem]" style={{ color: P.inkSoft }}>{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS ── */}
      <section className="container-app py-16">
        <div className="flex justify-between items-end mb-7 flex-wrap gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-medium mb-1" style={{ color: '#327069' }}>El catálogo</p>
            <h2 className="font-serif font-medium text-[2.6rem] leading-[1.05] m-0" style={{ color: P.ink }}>
              Materias primas <em>cuidadosamente</em> seleccionadas
            </h2>
          </div>
          <BtnGhost to="/insumos">Ver todo →</BtnGhost>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {CATEGORIAS.map(({ slug, num, label, t1, t2 }) => (
            <Link
              key={slug}
              to={`/insumos/${slug}`}
              className="relative overflow-hidden rounded-2xl aspect-[4/3] block hover:-translate-y-[3px] transition-transform duration-200"
              style={{ background: `linear-gradient(150deg, ${t1} 0%, ${t2} 100%)` }}
            >
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <span className="font-serif italic text-[3.5rem] leading-none text-white/90">{num}</span>
                <div>
                  <h3 className="font-serif font-medium text-[1.5rem] leading-[1.15] m-0" style={{ color: P.ink }}>{label}</h3>
                  <p className="text-[0.78rem] mt-1" style={{ color: 'rgba(42,40,32,0.7)' }}>Explorar →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── DESTACADOS ── */}
      {destacados.length > 0 && (
        <section className="container-app pb-16">
          <div className="mb-7">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-medium mb-1" style={{ color: P.deep }}>Destacados</p>
            <h2 className="font-serif font-medium text-[2.3rem] leading-[1.05] m-0" style={{ color: P.ink }}>Lo que más se formula esta primavera</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destacados.map((p) => (
              <ProdCard key={p.id} producto={p} onAdd={handleAdd} added={added[p.id]} />
            ))}
          </div>
        </section>
      )}

      {/* ── FILOSOFÍA ── */}
      <section style={{ background: P.tint, padding: '5rem 0', marginTop: '2rem' }}>
        <div className="container-app text-center" style={{ maxWidth: '1100px' }}>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] font-medium mb-5" style={{ color: P.deep }}>
            Nuestra filosofía · Desde 2018
          </p>
          <p
            className="font-serif italic leading-[1.15] mx-auto mb-7"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', maxWidth: '900px', color: P.ink }}
          >
            "Preserva tu ingrediente más esencial:{' '}
            <span className="not-italic font-serif" style={{ color: P.deep }}>tu belleza natural.</span>"
          </p>
          <p className="text-[0.95rem] mx-auto leading-relaxed" style={{ color: P.inkSoft, maxWidth: '540px' }}>
            Brindamos los mejores insumos cosméticos con orientación profesional para que cada cliente compre lo más adecuado a su fórmula.
          </p>
        </div>
      </section>

      {/* ── CURSOS PREVIEW ── */}
      <section className="container-app py-16">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-center">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-medium mb-2" style={{ color: P.deep }}>Aprende con nosotras</p>
            <h2 className="font-serif font-medium text-[2.6rem] leading-[1.05] m-0 mb-4" style={{ color: P.ink }}>
              Cursos y <em>asesorías</em> para formuladoras
            </h2>
            <p className="leading-[1.65] mb-6" style={{ color: P.inkSoft }}>
              Desde tu primer sérum hasta líneas completas. Aprende a calcular fases, elegir conservantes y diseñar texturas que enamoren.
            </p>
            <BtnPrimary to="/asesorias-cursos">Ver programa →</BtnPrimary>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CURSOS_STATIC.map((c) => (
              <Link
                key={c.titulo}
                to="/asesorias-cursos"
                className="bg-white border border-tinta/10 rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-[3px] hover:shadow-[0_14px_28px_rgba(0,0,0,0.06)] transition-all duration-200"
              >
                <span
                  className="inline-block self-start px-3 py-1 rounded-full text-[0.7rem] uppercase tracking-[0.1em]"
                  style={{ background: P.bgSoft, color: P.inkSoft }}
                >
                  {c.tipo}
                </span>
                <h3 className="font-serif font-medium text-[1.2rem] leading-[1.2] m-0" style={{ color: P.ink }}>{c.titulo}</h3>
                <p className="text-[0.75rem]" style={{ color: P.inkSoft }}>{c.dur}</p>
                <p className="font-medium mt-auto" style={{ color: P.ink }}>{c.precio}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="container-app pb-20">
        <div
          className="rounded-2xl p-10 md:p-12 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center"
          style={{ background: '#1b3f40', color: '#eef5f3' }}
        >
          <div>
            <h3 className="font-serif font-medium text-[2rem] m-0 mb-2">"Recetas que llegan a tu bandeja"</h3>
            <p className="text-[0.9rem] m-0" style={{ opacity: 0.85 }}>
              Una fórmula nueva al mes, descuentos para suscriptoras y aviso prioritario de stock.
            </p>
          </div>
          {newsSent ? (
            <p className="font-medium" style={{ color: '#d7a35a' }}>¡Te has suscrito!</p>
          ) : (
            <form onSubmit={handleNews} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email" required
                placeholder="tu@correo.es"
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full text-[0.9rem] focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#eef5f3',
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full font-medium text-[0.9rem] whitespace-nowrap transition-colors"
                style={{ background: '#d7a35a', color: '#1d1b17' }}
                onMouseEnter={e => e.currentTarget.style.background = 'white'}
                onMouseLeave={e => e.currentTarget.style.background = '#d7a35a'}
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
