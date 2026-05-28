import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const gold   = '#d6b97e';
const ok     = '#a9c597';
const warn   = '#e3c894';
const ink    = '#ece7d8';
const faint  = 'rgba(255,255,255,0.55)';
const mute   = 'rgba(236,231,216,0.7)';
const panel  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' };
const inputS = { padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: ink, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%' };

const fmt = (n) => Number(n || 0).toFixed(2).replace('.', ',') + ' €';

const empty = { titulo: '', descripcion: '', tipo: 'curso', precio: 0, duracion: '', imagenURL: '', disponible: true };

export default function Cursos() {
  const [items, setItems]     = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const snap = await getDocs(collection(db, 'cursos_asesorias'));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (editing.id) {
      const { id, ...rest } = editing;
      await updateDoc(doc(db, 'cursos_asesorias', id), rest);
    } else {
      await addDoc(collection(db, 'cursos_asesorias'), { ...editing, creadoEn: serverTimestamp() });
    }
    setEditing(null); await load();
  }

  async function remove(id) {
    if (!confirm('¿Eliminar?')) return;
    await deleteDoc(doc(db, 'cursos_asesorias', id));
    await load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Servicios</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Cursos y asesorías</h1>
        </div>
        <Btn gold onClick={() => setEditing({ ...empty })}>+ Nuevo</Btn>
      </div>

      {/* Table */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: faint, textAlign: 'left' }}>
                {['Título', 'Tipo', 'Duración', 'Precio', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: faint }}>Sin servicios registrados</td></tr>
              )}
              {items.map(c => (
                <tr key={c.id} onClick={() => setEditing(c)} style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: ink, fontWeight: 500 }}>{c.titulo}</div>
                    {c.descripcion && <div style={{ fontSize: '0.72rem', color: faint, marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.descripcion}</div>}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <TipoPill tipo={c.tipo} />
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: mute }}>{c.duracion || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: gold, fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem' }}>{fmt(c.precio)}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', background: (c.disponible ? ok : warn) + '26', color: c.disponible ? ok : warn }}>
                      {c.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={e => { e.stopPropagation(); setEditing(c); }} style={{ background: 'transparent', border: 'none', color: gold, cursor: 'pointer', fontSize: '1rem' }}>✎</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit drawer */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div style={{ width: 'min(500px, 100%)', background: '#25261f', color: ink, height: '100%', overflowY: 'auto', padding: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', color: faint }}>Servicios</div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.7rem', margin: '0.2rem 0 0', color: ink }}>
                  {editing.id ? 'Editar' : 'Nuevo'}
                </h2>
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: 'none', color: ink, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Título"><input style={inputS} value={editing.titulo} onChange={e => setEditing({...editing, titulo: e.target.value})} /></Field>
              <Field label="Descripción"><textarea style={{ ...inputS, resize: 'vertical' }} rows={3} value={editing.descripcion ?? ''} onChange={e => setEditing({...editing, descripcion: e.target.value})} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <Field label="Tipo">
                  <select style={inputS} value={editing.tipo} onChange={e => setEditing({...editing, tipo: e.target.value})}>
                    <option value="curso">Curso</option>
                    <option value="asesoria">Asesoría</option>
                  </select>
                </Field>
                <Field label="Precio (€)"><input type="number" step="0.01" style={inputS} value={editing.precio} onChange={e => setEditing({...editing, precio: parseFloat(e.target.value) || 0})} /></Field>
                <Field label="Duración"><input style={inputS} value={editing.duracion ?? ''} onChange={e => setEditing({...editing, duracion: e.target.value})} /></Field>
              </div>
              <Field label="URL imagen"><input style={inputS} value={editing.imagenURL ?? ''} onChange={e => setEditing({...editing, imagenURL: e.target.value})} /></Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', cursor: 'pointer', color: ink }}>
                <input type="checkbox" checked={editing.disponible} onChange={e => setEditing({...editing, disponible: e.target.checked})} /> Disponible
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Btn onClick={() => setEditing(null)}>Cancelar</Btn>
              {editing.id && <Btn onClick={() => { remove(editing.id); setEditing(null); }}>Eliminar</Btn>}
              <Btn gold onClick={save}>Guardar</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TipoPill({ tipo }) {
  const c = tipo === 'curso' ? gold : '#b6c7d6';
  return (
    <span style={{ display: 'inline-block', padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', background: c + '26', color: c }}>{tipo}</span>
  );
}

function Btn({ children, gold: isGold, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${isGold ? gold : 'rgba(255,255,255,0.15)'}`, background: isGold ? gold : 'transparent', color: isGold ? '#1c1d18' : '#ece7d8' }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', color: faint, marginBottom: '0.3rem' }}>{label}</div>
      {children}
    </div>
  );
}
