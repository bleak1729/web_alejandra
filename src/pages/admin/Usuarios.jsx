import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const gold   = '#d6b97e';
const ok     = '#a9c597';
const warn   = '#e3c894';
const ink    = '#ece7d8';
const faint  = 'rgba(255,255,255,0.55)';
const mute   = 'rgba(236,231,216,0.7)';
const panel  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' };
const inputS = { padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: ink, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'inherit', fontSize: '0.85rem', width: '100%' };

const ini = (nm) => (nm ?? '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const fmt = (n) => Number(n || 0).toFixed(2).replace('.', ',') + ' €';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  async function load() {
    const snap = await getDocs(collection(db, 'usuarios'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  useEffect(() => { load(); }, []);

  async function cambiarRol(uid, rol) {
    await updateDoc(doc(db, 'usuarios', uid), { rol });
    await load();
  }

  async function eliminar(uid) {
    if (!confirm('¿Eliminar usuario? Se borra el perfil de Firestore. La cuenta de Auth debe eliminarse desde la consola de Firebase.')) return;
    await deleteDoc(doc(db, 'usuarios', uid));
    await load();
  }

  const filtered = users.filter(u =>
    !search || u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.7rem', fontWeight: 500, color: faint }}>Comunidad</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '2rem', margin: '0.3rem 0 0', color: ink }}>Usuarios</h1>
        </div>
        <div style={{ fontSize: '0.85rem', color: faint }}>{filtered.length} usuarios</div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input style={{ ...inputS, maxWidth: 320 }} placeholder="Buscar por nombre o email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: faint, textAlign: 'left' }}>
                {['Usuario', 'Email', 'Teléfono', 'Pedidos', 'Gastado', 'Rol', 'Desde', ''].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: faint }}>Sin usuarios</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} style={{ transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9d3b8,#aab896)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.8rem', flexShrink: 0 }}>
                        {ini(u.nombre)}
                      </div>
                      <div style={{ color: ink, fontWeight: 500 }}>{u.nombre || '—'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: mute }}>{u.email}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: faint, fontSize: '0.78rem' }}>{u.telefono || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: ink, textAlign: 'center' }}>{u.pedidosCount ?? 0}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: gold }}>{fmt(u.totalGastado ?? 0)}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <select value={u.rol ?? 'cliente'} onChange={e => cambiarRol(u.id, e.target.value)} onClick={e => e.stopPropagation()} style={{ ...inputS, width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      <option value="cliente">cliente</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: faint, fontSize: '0.75rem' }}>
                    {u.creadoEn?.toDate?.()?.toLocaleDateString('es-ES') ?? '—'}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={e => { e.stopPropagation(); eliminar(u.id); }} style={{ background: 'transparent', border: 'none', color: 'rgba(224,161,148,0.7)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }} title="Eliminar usuario">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
