import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EMPRESA_DEFAULT = {
  email:      'hola@vidacosmetic.es',
  telefono:   '+34 600 100 200',
  calle:      'C/ Argumosa 14',
  ciudad:     'Madrid',
  pais:       'España',
  horario:    'Lun–Vie · 10:00–18:00 (CET)',
  descripcion:'Solo con cita previa',
};

export default function Contacto() {
  const { state } = useLocation();
  const [form, setForm] = useState({
    nombre:  '',
    email:   '',
    asunto:  state?.asunto  ?? 'Consulta de producto',
    mensaje: state?.mensaje ?? '',
  });
  const [sent, setSent]       = useState(false);
  const [empresa, setEmpresa] = useState(EMPRESA_DEFAULT);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'configuracion', 'empresa'));
        if (snap.exists()) setEmpresa({ ...EMPRESA_DEFAULT, ...snap.data() });
      } catch { /* usa defaults */ }
    })();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setForm({ nombre: '', email: '', asunto: 'Consulta de producto', mensaje: '' });
  }

  const direccion = [empresa.calle, empresa.ciudad, empresa.pais].filter(Boolean).join(', ');

  const INFO = [
    { icon: '✉', label: 'Email',    value: empresa.email,    sub: 'Respondemos en menos de 24h laborables' },
    { icon: '☎', label: 'Teléfono', value: empresa.telefono, sub: empresa.horario },
    { icon: '📍', label: 'Taller',   value: direccion,        sub: empresa.descripcion },
  ];

  return (
    <div className="container-app pb-20">

      {/* Breadcrumb */}
      <p className="text-sm text-tinta/50 pt-8">
        <Link to="/" className="hover:text-tinta transition">Inicio</Link>
        <span className="mx-2 opacity-50">/</span>
        <span>Contacto</span>
      </p>

      {/* Header */}
      <header className="mt-6 mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] font-medium text-verde-700">Estamos para ayudarte</p>
        <h1 className="font-serif text-5xl md:text-6xl text-verde-900 leading-tight mt-2">
          ¿Hablamos de tu <span className="italic">fórmula?</span>
        </h1>
      </header>

      {/* Main grid */}
      <div className="grid md:grid-cols-[1fr_1.3fr] gap-12">

        {/* Info columna */}
        <div>
          <div className="flex flex-col gap-6">
            {INFO.map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-verde-100 text-verde-700 flex items-center justify-center text-lg flex-none">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">{item.label}</p>
                  <p className="font-medium text-tinta mt-0.5">{item.value}</p>
                  <p className="text-sm text-tinta/50">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-verde-100 rounded-2xl">
            <h3 className="font-serif text-xl text-verde-900 mb-2">¿Eres profesional?</h3>
            <p className="text-sm text-tinta/60 leading-relaxed">
              Solicita tu cuenta B2B y accede a precios escalados, fichas técnicas extendidas y stock reservado.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white border border-tinta/10 rounded-2xl p-7">
          <h2 className="font-serif text-2xl text-verde-900 mb-6">Cuéntanos</h2>

          {sent ? (
            <p className="text-verde-700 font-medium py-4">Mensaje enviado — te respondemos pronto ✓</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Nombre</label>
                <input className="input rounded-xl" placeholder="Tu nombre" required
                  value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Email</label>
                <input className="input rounded-xl" type="email" placeholder="tu@correo.es" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Asunto</label>
                <select className="input rounded-xl"
                  value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })}>
                  <option>Consulta de producto</option>
                  <option>Asesoría cosmética</option>
                  <option>Pedido B2B / mayorista</option>
                  <option>Curso o taller</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Mensaje</label>
                <textarea className="input rounded-xl resize-y" rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte…" required
                  value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
              </div>
              <div className="col-span-2">
                <button type="submit" className="btn-primary">Enviar mensaje →</button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Mapa con dirección dinámica */}
      {direccion && (
        <div className="mt-14 rounded-2xl overflow-hidden" style={{ height: 340 }}>
          <iframe
            title="Ubicación"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed&hl=es`}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
