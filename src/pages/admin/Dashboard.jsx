import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

/* ── palette ── */
const gold   = '#d6b97e';
const ok     = '#a9c597';
const warn   = '#e3c894';
const danger = '#e0a194';
const info   = '#b6c7d6';
const ink    = '#ece7d8';
const faint  = 'rgba(255,255,255,0.55)';
const mute   = 'rgba(236,231,216,0.7)';
const panel  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' };

const TINTS = {
  acidos:    ['#e7d9c4','#d8c4a5'], ceras:    ['#efe3d0','#d9c8ad'],
  extractos: ['#c9d3b8','#aab896'], aceites:  ['#e9d6a6','#cdb37a'],
  envases:   ['#dad3c4','#bdb4a2'], pigmentos:['#d9bfae','#b9967d'],
};
const defaultTint = ['#dfe7d4','#9bb586'];
const tint = (cat) => TINTS[cat] ?? defaultTint;

const fmt  = (n) => Number(n || 0).toFixed(2).replace('.', ',') + ' €';
const ini  = (nm) => (nm ?? '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

const PILL_MAP = { pendiente: warn, confirmado: info, enviado: info, entregado: ok, cancelado: danger };
function Pill({ estado }) {
  const c = PILL_MAP[estado] ?? mute;
  return (
    <span style={{
      display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px',
      fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
      background: c + '26', color: c,
    }}>{estado}</span>
  );
}

const CHART_DATA   = [38,52,41,64,73,49,87,71,92,68,104,88];
const CHART_LABELS = ['7','8','9','10','11','12','13','14','15','16','17','18'];
const MAX_C = Math.max(...CHART_DATA);

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const user    = useAuthStore((s) => s.user);
  const nombre  = profile?.nombre?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Admin';

  const [stats, setStats] = useState({ pedidos: 0, facturacion: 0, clientes: 0, skus: 0, stockBajo: [], recientes: [], top: [] });

  useEffect(() => {
    (async () => {
      try {
        const [pedSnap, prodSnap, usrSnap, recSnap] = await Promise.all([
          getDocs(collection(db, 'pedidos')),
          getDocs(collection(db, 'productos')),
          getDocs(collection(db, 'usuarios')),
          getDocs(query(collection(db, 'pedidos'), orderBy('creadoEn', 'desc'), limit(5))),
        ]);
        const pedidos   = pedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const productos = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStats({
          pedidos:     pedidos.length,
          facturacion: pedidos.reduce((s, p) => s + (p.total ?? 0), 0),
          clientes:    usrSnap.docs.filter(d => d.data().rol !== 'admin').length,
          skus:        productos.filter(p => p.activo).length,
          stockBajo:   productos.filter(p => p.stock <= (p.stockMinimo ?? 0)).slice(0, 5),
          recientes:   recSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          top:         productos.filter(p => p.destacado).slice(0, 5),
        });
      } catch (e) { console.warn(e); }
    })();
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>
            Panel · {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2.4rem', margin: '0.3rem 0 0', color: ink }}>
            {saludo}, {nombre}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Btn>🔔 Alertas</Btn>
          <Btn gold>+ Nuevo producto</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pedidos del mes',  value: stats.pedidos,                 sub: '+12% vs anterior' },
          { label: 'Facturación',      value: fmt(stats.facturacion),         sub: '+8% vs anterior' },
          { label: 'Clientes activos', value: stats.clientes,                 sub: 'usuarios registrados' },
          { label: 'SKUs activos',     value: stats.skus,                     sub: `${stats.top.length} destacados` },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ padding: '1.2rem', ...panel }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>{label}</div>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', marginTop: '0.5rem', color: ink }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: faint, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1: chart + stock alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.2rem' }}>
        <div style={{ padding: '1.4rem', ...panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: 0, color: ink }}>Ventas — últimos 12 días</h3>
            <span style={{ fontSize: '0.75rem', color: faint }}>en €</span>
          </div>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', padding: '0.5rem 0' }}>
            {CHART_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${(v / MAX_C) * 100}%`,
                    background: i === CHART_DATA.length - 1
                      ? gold
                      : 'linear-gradient(to top, rgba(214,185,126,0.4), rgba(214,185,126,0.8))',
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: faint }}>{CHART_LABELS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1.4rem', ...panel }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: '0 0 1rem', color: ink }}>Alertas de stock</h3>
          {stats.stockBajo.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: faint }}>Sin alertas.</p>
          ) : (
            stats.stockBajo.map((p) => {
              const sc = p.stock === 0 ? danger : warn;
              return (
                <div key={p.id} style={{ padding: '0.7rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: ink }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.7rem', color: faint }}>Mín: {p.stockMinimo}</div>
                  </div>
                  <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', background: sc + '26', color: sc }}>
                    {p.stock} uds
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Row 2: recent orders + top products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.2rem', marginTop: '1.2rem' }}>
        <div style={{ padding: '1.4rem', ...panel }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: '0 0 1rem', color: ink }}>Pedidos recientes</h3>
          {stats.recientes.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: faint }}>Sin actividad.</p>
          ) : (
            stats.recientes.map((p) => (
              <div key={p.id} style={{ padding: '0.6rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', color: faint }}>{p.id.slice(0,10)}…</div>
                  <div style={{ fontSize: '0.88rem', color: ink }}>{p.usuarioId?.slice(0,10)}…</div>
                </div>
                <Pill estado={p.estado ?? 'pendiente'} />
                <div style={{ fontWeight: 500, minWidth: 80, textAlign: 'right', color: ink }}>{fmt(p.total)}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '1.4rem', ...panel }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: '0 0 1rem', color: ink }}>Top productos del mes</h3>
          {stats.top.map((p, i) => {
            const [t1, t2] = tint(p.categoria);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.7rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: `linear-gradient(135deg, ${t1}, ${t2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                  <div style={{ fontSize: '0.72rem', color: faint }}>{fmt(p.precio)} · {p.unidad}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: gold }}>{8 + i * 4} vts</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, gold: isGold, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.5rem 0.9rem', borderRadius: '999px',
        fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer',
        border: `1px solid ${isGold ? '#d6b97e' : 'rgba(255,255,255,0.15)'}`,
        background: isGold ? '#d6b97e' : 'transparent',
        color: isGold ? '#1c1d18' : '#ece7d8',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
