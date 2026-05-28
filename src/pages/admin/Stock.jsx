import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

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

const TINTS = { acidos:['#e7d9c4','#d8c4a5'], ceras:['#efe3d0','#d9c8ad'], extractos:['#c9d3b8','#aab896'], aceites:['#e9d6a6','#cdb37a'], envases:['#dad3c4','#bdb4a2'], pigmentos:['#d9bfae','#b9967d'] };
const tint = (cat) => TINTS[cat] ?? ['#dfe7d4','#9bb586'];
const ini  = (nm) => (nm ?? '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const stockC = (p) => p.stock === 0 ? danger : p.stock <= (p.stockMinimo ?? 0) ? warn : ok;

export default function Stock() {
  const [productos, setProductos]   = useState([]);
  const [movimientos, setMovs]      = useState([]);
  const [filtro, setFiltro]         = useState('todos');
  const [selected, setSelected]     = useState(null);
  const [cantidad, setCantidad]     = useState(0);
  const [motivo, setMotivo]         = useState('reposicion');

  async function load() {
    const snap = await getDocs(collection(db, 'productos'));
    setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    const mov = await getDocs(query(collection(db, 'stock_movimientos'), orderBy('fecha', 'desc'), limit(20)));
    setMovs(mov.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function registrar() {
    if (!selected || cantidad === 0) return;
    const delta = motivo === 'venta' ? -Math.abs(cantidad) : cantidad;
    await updateDoc(doc(db, 'productos', selected.id), { stock: (selected.stock ?? 0) + delta, actualizadoEn: serverTimestamp() });
    await addDoc(collection(db, 'stock_movimientos'), { productoId: selected.id, tipo: delta > 0 ? 'entrada' : 'salida', cantidad: Math.abs(delta), motivo, adminId: auth.currentUser?.uid ?? '', fecha: serverTimestamp() });
    setSelected(null); setCantidad(0); await load();
  }

  const list = filtro === 'todos' ? productos
    : filtro === 'bajo'    ? productos.filter(p => p.stock > 0 && p.stock <= (p.stockMinimo ?? 0))
    : productos.filter(p => p.stock === 0);

  const chips = [
    { k: 'todos',   l: 'Todos',   n: productos.length },
    { k: 'bajo',    l: 'Bajo',    n: productos.filter(p => p.stock > 0 && p.stock <= (p.stockMinimo ?? 0)).length },
    { k: 'agotado', l: 'Agotado', n: productos.filter(p => p.stock === 0).length },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Inventario</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Stock y movimientos</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.2rem' }}>
        {/* Stock list */}
        <div style={{ ...panel, padding: 0 }}>
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: 0, color: ink }}>Stock actual</h3>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {chips.map(({ k, l, n }) => (
                <button key={k} onClick={() => setFiltro(k)} style={{ padding: '0.35rem 0.8rem', borderRadius: '999px', border: `1px solid ${filtro === k ? gold : 'rgba(255,255,255,0.15)'}`, background: filtro === k ? gold : 'transparent', color: filtro === k ? '#1c1d18' : mute, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {l} <span style={{ opacity: 0.65 }}>· {n}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {list.map(p => {
              const [t1, t2] = tint(p.categoria);
              return (
                <div key={p.id} style={{ padding: '0.85rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '6px', background: `linear-gradient(135deg,${t1},${t2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.7rem', flexShrink: 0 }}>{ini(p.nombre)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: ink, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.72rem', color: faint }}>Mín: {p.stockMinimo} · {p.unidad}</div>
                  </div>
                  <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', color: stockC(p) }}>{p.stock}</div>
                  <button onClick={() => setSelected(p)} style={{ background: 'transparent', border: 'none', color: gold, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>+ Entrada</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Movements */}
        <div style={{ padding: '1.4rem', ...panel }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.3rem', margin: '0 0 1rem', color: ink }}>Movimientos recientes</h3>
          {movimientos.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: faint }}>Sin movimientos.</p>
          ) : (
            movimientos.map(m => {
              const isEnt  = m.tipo === 'entrada';
              const c      = isEnt ? ok : m.tipo === 'salida' ? info : warn;
              const label  = isEnt ? `↑ Entrada ${m.cantidad}` : m.tipo === 'salida' ? `↓ Salida ${m.cantidad}` : `⟳ Ajuste ${m.cantidad}`;
              return (
                <div key={m.id} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', background: c + '26', color: c }}>{label}</span>
                    <span style={{ fontSize: '11px', color: faint }}>{m.fecha?.toDate?.()?.toLocaleString('es-ES') ?? '—'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: ink }}>{m.productoId?.slice(0,16)}…</div>
                  <div style={{ fontSize: '0.72rem', color: faint }}>{m.motivo}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Adjust modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ width: 'min(440px, 100%)', background: '#25261f', borderRadius: '14px', padding: '1.8rem', color: ink }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.5rem', margin: 0, color: ink }}>Ajustar stock</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: ink, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
            </div>
            <p style={{ fontSize: '0.88rem', color: mute, marginBottom: '1rem' }}>{selected.nombre} — Actual: <strong style={{ color: ink }}>{selected.stock} {selected.unidad}</strong></p>
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', color: faint, marginBottom: '0.3rem' }}>Cantidad</div>
              <input type="number" style={inputS} value={cantidad} onChange={e => setCantidad(parseInt(e.target.value)||0)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', color: faint, marginBottom: '0.3rem' }}>Motivo</div>
              <select style={inputS} value={motivo} onChange={e => setMotivo(e.target.value)}>
                <option value="reposicion">Reposición</option>
                <option value="ajuste_manual">Ajuste manual</option>
                <option value="venta">Salida por venta</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <Btn onClick={() => setSelected(null)}>Cancelar</Btn>
              <Btn gold onClick={registrar}>Registrar</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Btn({ children, gold: isGold, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${isGold ? gold : 'rgba(255,255,255,0.15)'}`, background: isGold ? gold : 'transparent', color: isGold ? '#1c1d18' : '#ece7d8' }}>
      {children}
    </button>
  );
}
