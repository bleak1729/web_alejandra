import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const gold   = '#d6b97e';
const ink    = '#ece7d8';
const faint  = 'rgba(255,255,255,0.55)';
const mute   = 'rgba(236,231,216,0.7)';
const panel  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' };
const inputS = { padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: ink, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%' };

const TIPO_LABEL = { 'categorias-insumos': 'Insumos', 'complementos-varios': 'Complementos' };
const CAT_TINTS = ['#e7d9c4,#d8c4a5','#efe3d0,#d9c8ad','#c9d3b8,#aab896','#e9d6a6,#cdb37a','#dad3c4,#bdb4a2','#d9bfae,#b9967d'];
const catGrad = (i) => { const [a, b] = CAT_TINTS[i % CAT_TINTS.length].split(','); return `linear-gradient(135deg,${a},${b})`; };

const empty = { nombre: '', slug: '', descripcion: '', imagenURL: '', tipo: 'categorias-insumos' };

export default function Categorias() {
  const [items, setItems]     = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const snap = await getDocs(collection(db, 'categorias'));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (editing.id) {
      const { id, ...rest } = editing;
      await updateDoc(doc(db, 'categorias', id), rest);
    } else {
      await addDoc(collection(db, 'categorias'), editing);
    }
    setEditing(null); await load();
  }

  async function remove(id) {
    if (!confirm('¿Eliminar categoría?')) return;
    await deleteDoc(doc(db, 'categorias', id));
    await load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Catálogo</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Categorías</h1>
        </div>
        <Btn gold onClick={() => setEditing({ ...empty })}>+ Nueva categoría</Btn>
      </div>

      {/* Category cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {items.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: faint, gridColumn: '1/-1' }}>Sin categorías registradas.</p>
        )}
        {items.map((c, i) => (
          <div key={c.id} style={{ ...panel, overflow: 'hidden' }}>
            {/* Thumbnail */}
            <div style={{ height: 120, background: c.imagenURL ? `url(${c.imagenURL}) center/cover` : catGrad(i), position: 'relative' }}>
              <div style={{ position: 'absolute', top: 8, right: 8, padding: '0.2rem 0.55rem', borderRadius: '999px', background: 'rgba(28,29,24,0.7)', fontSize: '0.65rem', color: mute, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {TIPO_LABEL[c.tipo] ?? c.tipo}
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: '1rem 1.1rem 0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.15rem', color: ink }}>{c.nombre}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: faint, marginTop: 2 }}>{c.slug}</div>
                </div>
              </div>
              {c.descripcion && (
                <p style={{ fontSize: '0.78rem', color: mute, marginTop: '0.5rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descripcion}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditing(c)} style={{ background: 'transparent', border: 'none', color: gold, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>✎ Editar</button>
                <button onClick={() => remove(c.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(224,161,148,0.7)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div style={{ width: 'min(480px, 100%)', background: '#25261f', borderRadius: '14px', padding: '1.8rem', color: ink }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.5rem', margin: 0, color: ink }}>{editing.id ? 'Editar' : 'Nueva'} categoría</h2>
              <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: 'none', color: ink, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Nombre"><input style={inputS} value={editing.nombre} onChange={e => setEditing({...editing, nombre: e.target.value})} /></Field>
              <Field label="Slug"><input style={inputS} value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} /></Field>
              <Field label="Descripción"><textarea style={{ ...inputS, resize: 'vertical' }} rows={2} value={editing.descripcion} onChange={e => setEditing({...editing, descripcion: e.target.value})} /></Field>
              <Field label="Tipo">
                <select style={inputS} value={editing.tipo} onChange={e => setEditing({...editing, tipo: e.target.value})}>
                  <option value="categorias-insumos">Categorías de insumos</option>
                  <option value="complementos-varios">Complementos varios</option>
                </select>
              </Field>
              <Field label="URL de imagen"><input style={inputS} value={editing.imagenURL ?? ''} onChange={e => setEditing({...editing, imagenURL: e.target.value})} /></Field>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <Btn onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn gold onClick={save}>Guardar</Btn>
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

function Field({ label, children }) {
  return (
    <div>
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', color: faint, marginBottom: '0.3rem' }}>{label}</div>
      {children}
    </div>
  );
}
