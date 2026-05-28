import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const PAISES_CIUDADES = {
  'España': [
    'A Coruña','Albacete','Alcalá de Henares','Alcorcón','Algeciras','Alicante','Almería',
    'Badajoz','Badalona','Barcelona','Bilbao','Burgos','Cádiz','Cartagena',
    'Castellón de la Plana','Córdoba','Elche','Fuenlabrada','Getafe','Gijón','Granada',
    'Hospitalet de Llobregat','Huelva','Jaén','Jerez de la Frontera',
    'Las Palmas de Gran Canaria','León','Lleida','Logroño','Lugo','Madrid','Málaga',
    'Mataró','Móstoles','Murcia','Ourense','Oviedo','Palma','Pamplona','Pontevedra',
    'Sabadell','Salamanca','San Sebastián','Santa Cruz de Tenerife','Santander',
    'Santiago de Compostela','Sevilla','Tarragona','Terrassa','Toledo','Valencia',
    'Valladolid','Vigo','Vitoria-Gasteiz','Zaragoza',
  ],
  'Argentina':  ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata','Tucumán','Mar del Plata','Salta','Santa Fe','San Juan'],
  'México':     ['Ciudad de México','Guadalajara','Monterrey','Puebla','Tijuana','León','Ciudad Juárez','Zapopan','Mérida','San Luis Potosí'],
  'Colombia':   ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Cúcuta','Bucaramanga','Pereira'],
  'Chile':      ['Santiago','Valparaíso','Concepción','Antofagasta','Viña del Mar','Temuco','Rancagua'],
  'Perú':       ['Lima','Arequipa','Trujillo','Chiclayo','Iquitos','Cusco','Piura'],
  'Uruguay':    ['Montevideo','Salto','Ciudad de la Costa','Paysandú','Las Piedras'],
  'Venezuela':  ['Caracas','Maracaibo','Valencia','Barquisimeto','Maracay'],
  'Ecuador':    ['Quito','Guayaquil','Cuenca','Santo Domingo','Ambato'],
  'Bolivia':    ['Santa Cruz de la Sierra','La Paz','Cochabamba','Oruro','Sucre'],
  'Paraguay':   ['Asunción','Ciudad del Este','San Lorenzo','Luque','Capiatá'],
  'Otro':       [],
};
const PAISES = Object.keys(PAISES_CIUDADES);

const EMPTY = {
  nombre:      'Vidacosmetic&mas',
  email:       'hola@vidacosmetic.es',
  telefono:    '+34 600 100 200',
  calle:       'C/ Argumosa 14',
  ciudad:      'Madrid',
  pais:        'España',
  horario:     'Lun–Vie · 10:00–18:00 (CET)',
  whatsapp:    '',
  instagram:   '',
  descripcion: 'Insumos cosméticos con orientación profesional. Solo con cita previa.',
};

/* ── estilos base ── */
const S = {
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0.6rem 0.85rem',
    color: '#ece7d8', fontSize: '0.9rem',
    outline: 'none', width: '100%', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  label: {
    fontSize: '0.72rem', textTransform: 'uppercase',
    letterSpacing: '0.12em', color: 'rgba(236,231,216,0.55)',
    display: 'block', marginBottom: 4,
  },
  locked: { opacity: 0.5, cursor: 'not-allowed' },
};

export default function AdminEmpresa() {
  const [form,       setForm]       = useState(EMPTY);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [error,      setError]      = useState('');
  const [ciudadQ,    setCiudadQ]    = useState(EMPTY.ciudad);
  const [showDrop,   setShowDrop]   = useState(false);

  /* carga inicial */
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'configuracion', 'empresa'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.direccion && !d.calle) { d.calle = d.direccion; delete d.direccion; }
          const merged = { ...EMPTY, ...d };
          setForm(merged);
          setCiudadQ(merged.ciudad);
        }
      } catch (e) {
        setError('No se pudo cargar la configuración: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ciudades filtradas */
  const ciudadesPais = PAISES_CIUDADES[form.pais] ?? [];
  const ciudadesFilt = ciudadQ
    ? ciudadesPais.filter(c => c.toLowerCase().includes(ciudadQ.toLowerCase()))
    : ciudadesPais;

  function upd(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handlePais(e) {
    upd('pais', e.target.value);
    upd('ciudad', '');
    setCiudadQ('');
  }

  function pickCiudad(c) {
    upd('ciudad', c);
    setCiudadQ(c);
    setShowDrop(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const ciudad = ciudadQ || form.ciudad;
    try {
      await setDoc(
        doc(db, 'configuracion', 'empresa'),
        { ...form, ciudad, actualizadoEn: serverTimestamp() },
        { merge: true }
      );
      upd('ciudad', ciudad);
      setEditMode(false);
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setError('');
    setEditMode(false);
  }

  const direccionCompleta = [form.calle, form.ciudad, form.pais].filter(Boolean).join(', ');

  if (loading) return <p style={{ color: 'rgba(236,231,216,0.6)' }}>Cargando…</p>;

  /* helper input inline (sin componente hijo para evitar re-mount) */
  const inp = (key, placeholder = '', type = 'text') => (
    <input
      type={type}
      disabled={!editMode}
      value={form[key] ?? ''}
      placeholder={placeholder}
      onChange={e => upd(key, e.target.value)}
      style={{ ...S.input, ...(!editMode ? S.locked : {}) }}
    />
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '2rem', color: '#ece7d8', marginBottom: '0.3rem' }}>
        Datos de la empresa
      </h1>
      <p style={{ color: 'rgba(236,231,216,0.55)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Esta información aparece en la página de contacto.
      </p>

      {error && (
        <div style={{ background: 'rgba(194,114,90,0.2)', border: '1px solid rgba(194,114,90,0.4)', borderRadius: 10, padding: '0.7rem 1rem', color: '#e09880', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Datos generales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={S.label}>Nombre de la empresa</label>{inp('nombre')}</div>
          <div><label style={S.label}>Email de contacto</label>{inp('email', '', 'email')}</div>
          <div><label style={S.label}>Teléfono</label>{inp('telefono')}</div>
          <div><label style={S.label}>WhatsApp (opcional)</label>{inp('whatsapp', '+34 600 000 000')}</div>
        </div>

        {/* Dirección */}
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ ...S.label, marginBottom: 2 }}>Dirección del local</p>

          <div>
            <label style={S.label}>Calle y número</label>
            <input
              disabled={!editMode}
              value={form.calle}
              placeholder="C/ Nombre de la calle, 14"
              onChange={e => upd('calle', e.target.value)}
              style={{ ...S.input, ...(!editMode ? S.locked : {}) }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {/* País */}
            <div>
              <label style={S.label}>País</label>
              <select
                disabled={!editMode}
                value={form.pais}
                onChange={handlePais}
                style={{ ...S.input, cursor: editMode ? 'pointer' : 'not-allowed', ...(!editMode ? S.locked : {}) }}
              >
                {PAISES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Ciudad */}
            <div style={{ position: 'relative' }}>
              <label style={S.label}>Ciudad</label>
              <input
                disabled={!editMode}
                value={ciudadQ}
                placeholder="Escribe para filtrar…"
                onChange={e => { setCiudadQ(e.target.value); setShowDrop(true); }}
                onFocus={() => { if (editMode) setShowDrop(true); }}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                style={{ ...S.input, ...(!editMode ? S.locked : {}) }}
              />
              {showDrop && editMode && ciudadesFilt.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: '#2a2b24', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto',
                  listStyle: 'none', padding: 0, margin: 0,
                }}>
                  {ciudadesFilt.map(c => (
                    <li key={c}>
                      <button
                        type="button"
                        onMouseDown={() => pickCiudad(c)}
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', color: '#ece7d8', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Otros campos */}
        <div><label style={S.label}>Horario de atención</label>{inp('horario', 'Lun–Vie · 10:00–18:00')}</div>
        <div><label style={S.label}>Instagram (opcional)</label>{inp('instagram', '@vidacosmetic')}</div>

        <div>
          <label style={S.label}>Descripción del local</label>
          <textarea
            disabled={!editMode}
            rows={3}
            value={form.descripcion}
            onChange={e => upd('descripcion', e.target.value)}
            style={{ ...S.input, resize: 'vertical', ...(!editMode ? S.locked : {}) }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              style={{ padding: '0.65rem 1.8rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', background: 'transparent', color: '#ece7d8', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit' }}
            >
              ✎ Editar
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={saving}
                style={{ padding: '0.65rem 1.8rem', borderRadius: 999, border: 'none', cursor: saving ? 'wait' : 'pointer', background: '#d6b97e', color: '#1c1d18', fontWeight: 600, fontSize: '0.85rem', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ padding: '0.65rem 1.2rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'transparent', color: 'rgba(236,231,216,0.6)', fontSize: '0.85rem', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>

      {/* Vista previa mapa */}
      {direccionCompleta && (
        <div style={{ marginTop: '2.5rem' }}>
          <p style={{ ...S.label, marginBottom: '0.75rem' }}>Vista previa del mapa</p>
          <iframe
            title="Mapa"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed&hl=es`}
            style={{ width: '100%', height: 240, borderRadius: 12, border: 'none' }}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
