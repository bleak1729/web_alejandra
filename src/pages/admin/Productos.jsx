import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

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
const inputS = { padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: ink, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%' };

const TINTS = {
  acidos:['#e7d9c4','#d8c4a5'], ceras:['#efe3d0','#d9c8ad'],
  extractos:['#c9d3b8','#aab896'], aceites:['#e9d6a6','#cdb37a'],
  envases:['#dad3c4','#bdb4a2'], pigmentos:['#d9bfae','#b9967d'],
};
const CAT_LABEL = {
  acidos:'Ácidos cosméticos', ceras:'Ceras y emulsionantes',
  extractos:'Extractos botánicos', aceites:'Aceites y mantecas',
  envases:'Envases y complementos', pigmentos:'Pigmentos y colorantes',
};
const ini  = (nm) => (nm ?? '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const fmt  = (n) => Number(n || 0).toFixed(2).replace('.', ',') + ' €';
const tint = (cat) => TINTS[cat] ?? ['#dfe7d4','#9bb586'];
const stockClass = (p) => p.stock === 0 ? danger : p.stock <= (p.stockMinimo ?? 0) ? warn : ok;

function exportCSV(items) {
  const cols = ['nombre','categoria','precio','unidad','stock','stockMinimo','activo','destacado'];
  const csv = [cols.join(','), ...items.map(p => cols.map(c => {
    const v = p[c] ?? ''; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
  }).join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `productos_${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
}

function toBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

const empty = { nombre: '', descripcion: '', categoria: '', subcategoria: 'categorias', precio: 0, unidad: 'gr', stock: 0, stockMinimo: 5, activo: true, destacado: false, imagenURL: '' };

export default function Productos() {
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState('');
  const [catF,   setCatF]   = useState('');
  const [editing, setEditing] = useState(null);
  const [file, setFile]     = useState(null);
  const [busy, setBusy]     = useState(false);

  async function load() {
    const snap = await getDocs(collection(db, 'productos'));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setBusy(true);
    try {
      const data = { ...editing, actualizadoEn: serverTimestamp() };
      let id = editing.id;
      if (!id) { data.creadoEn = serverTimestamp(); const r = await addDoc(collection(db, 'productos'), data); id = r.id; }
      if (file) {
        if (import.meta.env.DEV) { data.imagenURL = await toBase64(file); }
        else { const r = ref(storage, `productos/${id}/${file.name}`); await uploadBytes(r, file); data.imagenURL = await getDownloadURL(r); }
        await updateDoc(doc(db, 'productos', id), { imagenURL: data.imagenURL });
      } else if (editing.id) { await updateDoc(doc(db, 'productos', id), data); }
      setEditing(null); setFile(null); await load();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm('¿Eliminar producto?')) return;
    await deleteDoc(doc(db, 'productos', id)); await load();
  }

  const filtered = items
    .filter(p => !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !catF || p.categoria === catF);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Catálogo</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Productos</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Btn onClick={() => exportCSV(items)}>↓ CSV</Btn>
          <Btn gold onClick={() => setEditing({ ...empty })}>+ Nuevo producto</Btn>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input style={{ ...inputS, flex: 1, minWidth: 200 }} placeholder="Buscar por nombre…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...inputS, width: 'auto' }} value={catF} onChange={e => setCatF(e.target.value)}>
          <option value="">Todas las categorías</option>
          {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: faint, textAlign: 'left' }}>
                {['Producto','Categoría','Precio','Stock','Estado',''].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: faint }}>Sin resultados</td></tr>
              )}
              {filtered.map(p => {
                const [t1, t2] = tint(p.categoria);
                return (
                  <tr key={p.id} onClick={() => setEditing(p)} style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '6px', background: `linear-gradient(135deg,${t1},${t2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.7rem', flexShrink: 0 }}>
                          {ini(p.nombre)}
                        </div>
                        <div>
                          <div style={{ color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>{p.nombre}</div>
                          <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{p.id?.slice(0,8)} · {p.descripcion?.slice(0,30)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: mute }}>{CAT_LABEL[p.categoria] ?? p.categoria}</td>
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: ink }}>{fmt(p.precio)}<div style={{ fontSize: 11, color: faint }}>/ {p.unidad}</div></td>
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: stockClass(p) }}>{p.stock} uds</span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Pill label={p.activo ? 'Activo' : 'Inactivo'} color={p.activo ? ok : mute} />
                      {p.destacado && <Pill label="★" color={info} style={{ marginLeft: 4 }} />}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={e => { e.stopPropagation(); setEditing(p); }} style={{ background: 'transparent', border: 'none', color: gold, cursor: 'pointer', fontSize: '1rem' }}>✎</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) { setEditing(null); setFile(null); } }}>
          <div style={{ width: 'min(560px, 100%)', background: '#25261f', color: ink, height: '100%', overflowY: 'auto', padding: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', color: faint }}>Catálogo</div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.7rem', margin: '0.2rem 0 0', color: ink }}>
                  {editing.id ? 'Editar producto' : 'Nuevo producto'}
                </h2>
              </div>
              <button onClick={() => { setEditing(null); setFile(null); }} style={{ background: 'transparent', border: 'none', color: ink, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Nombre"><input style={inputS} value={editing.nombre} onChange={e => setEditing({...editing, nombre: e.target.value})} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <Field label="Precio (€)"><input type="number" step="0.01" style={inputS} value={editing.precio} onChange={e => setEditing({...editing, precio: parseFloat(e.target.value)||0})} /></Field>
                <Field label="Unidad">
                  <select style={inputS} value={editing.unidad} onChange={e => setEditing({...editing, unidad: e.target.value})}>
                    <option>gr</option><option>ml</option><option>unidad</option><option>kg</option>
                  </select>
                </Field>
                <Field label="Stock"><input type="number" style={inputS} value={editing.stock} onChange={e => setEditing({...editing, stock: parseInt(e.target.value)||0})} /></Field>
                <Field label="Stock mín."><input type="number" style={inputS} value={editing.stockMinimo} onChange={e => setEditing({...editing, stockMinimo: parseInt(e.target.value)||0})} /></Field>
              </div>
              <Field label="Categoría">
                <select style={inputS} value={editing.categoria} onChange={e => setEditing({...editing, categoria: e.target.value})}>
                  <option value="">— elegir —</option>
                  {Object.entries(CAT_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Descripción / INCI"><textarea style={{ ...inputS, resize: 'vertical' }} rows={3} value={editing.descripcion ?? ''} onChange={e => setEditing({...editing, descripcion: e.target.value})} /></Field>
              <Field label="Imagen"><input type="file" accept="image/*" style={{ ...inputS, padding: '0.4rem' }} onChange={e => setFile(e.target.files[0])} /></Field>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <ChkLabel label="Activo"    checked={editing.activo}    onChange={v => setEditing({...editing, activo: v})} />
                <ChkLabel label="Destacado" checked={editing.destacado} onChange={v => setEditing({...editing, destacado: v})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Btn onClick={() => { setEditing(null); setFile(null); }}>Cancelar</Btn>
              <Btn gold onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Btn({ children, gold: isGold, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${isGold ? gold : 'rgba(255,255,255,0.15)'}`, background: isGold ? gold : 'transparent', color: isGold ? '#1c1d18' : '#ece7d8', opacity: disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}
function Pill({ label, color, style: s }) {
  return <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', background: color + '26', color, textTransform: 'uppercase', letterSpacing: '0.08em', ...s }}>{label}</span>;
}
function Field({ label, children }) {
  return (
    <div>
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', color: faint, marginBottom: '0.3rem' }}>{label}</div>
      {children}
    </div>
  );
}
function ChkLabel({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', cursor: 'pointer', color: ink }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /> {label}
    </label>
  );
}
