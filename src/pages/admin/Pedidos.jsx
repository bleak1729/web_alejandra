import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const gold   = '#d6b97e';
const ok     = '#a9c597';
const warn   = '#e3c894';
const danger = '#e0a194';
const info   = '#b6c7d6';
const ink    = '#ece7d8';
const faint  = 'rgba(255,255,255,0.55)';
const mute   = 'rgba(236,231,216,0.7)';
const panel  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' };
const inputS = { padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: ink, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%' };

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
const PILL_MAP = { pendiente: warn, confirmado: info, enviado: info, entregado: ok, cancelado: danger };
const fmt = (n) => Number(n || 0).toFixed(2).replace('.', ',') + ' €';

export default function Pedidos() {
  const [items, setItems]     = useState([]);
  const [filtro, setFiltro]   = useState('todos');
  const [selected, setSelected] = useState(null);

  async function load() {
    const snap = await getDocs(query(collection(db, 'pedidos'), orderBy('creadoEn', 'desc')));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function cambiarEstado(id, estado) {
    await updateDoc(doc(db, 'pedidos', id), { estado, actualizadoEn: serverTimestamp() });
    if (selected?.id === id) setSelected(s => ({ ...s, estado }));
    await load();
  }

  const chips = [
    { k: 'todos', l: 'Todos', n: items.length },
    ...ESTADOS.map(e => ({ k: e, l: e.charAt(0).toUpperCase() + e.slice(1), n: items.filter(p => p.estado === e).length })),
  ];

  const filtrados = filtro === 'todos' ? items : items.filter(p => p.estado === filtro);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Ventas</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Pedidos</h1>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {chips.map(({ k, l, n }) => (
          <button key={k} onClick={() => setFiltro(k)} style={{ padding: '0.35rem 0.8rem', borderRadius: '999px', border: `1px solid ${filtro === k ? gold : 'rgba(255,255,255,0.15)'}`, background: filtro === k ? gold : 'transparent', color: filtro === k ? '#1c1d18' : mute, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {l} <span style={{ opacity: 0.65 }}>· {n}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 680 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: faint, textAlign: 'left' }}>
                {['Pedido', 'Cliente', 'Fecha', 'Pago', 'Estado', 'Total', ''].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: faint }}>Sin pedidos</td></tr>
              )}
              {filtrados.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: gold }}>{p.id.slice(0, 10)}…</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: mute }}>
                    {p.usuarioId?.slice(0, 10)}…
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: faint, fontSize: '0.78rem' }}>
                    {p.creadoEn?.toDate?.()?.toLocaleDateString('es-ES') ?? '—'}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: faint, fontSize: '0.78rem' }}>
                    {p.metodoPago ?? '—'}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Pill estado={p.estado ?? 'pendiente'} />
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: ink, fontWeight: 500 }}>
                    {fmt(p.total)}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: faint }}>›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ width: 'min(520px, 100%)', background: '#25261f', color: ink, height: '100%', overflowY: 'auto', padding: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', color: faint }}>Detalle</div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.7rem', margin: '0.2rem 0 0', color: ink }}>Pedido</h2>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: gold, marginTop: 2 }}>{selected.id}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: ink, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
            </div>

            {/* Mini-grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {[
                { l: 'Cliente', v: selected.usuarioId?.slice(0, 16) + '…' },
                { l: 'Fecha', v: selected.creadoEn?.toDate?.()?.toLocaleString('es-ES') ?? '—' },
                { l: 'Pago', v: selected.metodoPago ?? '—' },
                { l: 'Total', v: fmt(selected.total) },
              ].map(({ l, v }) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: faint, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: '0.88rem', color: ink }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Estado chips */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: faint, marginBottom: '0.5rem' }}>Cambiar estado</div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {ESTADOS.map(e => {
                  const c = PILL_MAP[e] ?? mute;
                  const active = selected.estado === e;
                  return (
                    <button key={e} onClick={() => cambiarEstado(selected.id, e)} style={{ padding: '0.3rem 0.7rem', borderRadius: '999px', border: `1px solid ${active ? c : 'rgba(255,255,255,0.15)'}`, background: active ? c + '26' : 'transparent', color: active ? c : mute, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: faint, marginBottom: '0.5rem' }}>Productos</div>
              {(selected.items ?? []).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: faint }}>Sin items registrados.</p>
              ) : (
                (selected.items ?? []).map((it, i) => (
                  <div key={i} style={{ padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: ink }}>{it.nombre}</div>
                      <div style={{ fontSize: '0.72rem', color: faint }}>x{it.cantidad} · {fmt(it.precioUnitario)} c/u</div>
                    </div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', color: gold }}>{fmt(it.subtotal)}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Btn>Generar guía de envío</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ estado }) {
  const c = PILL_MAP[estado] ?? mute;
  return (
    <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', background: c + '26', color: c }}>{estado}</span>
  );
}

function Btn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#ece7d8' }}>
      {children}
    </button>
  );
}
