import { useState } from 'react';
import { Link } from 'react-router-dom';

const INFO = [
  {
    icon: '✉',
    label: 'Email',
    value: 'hola@vidacosmetic.es',
    sub: 'Respondemos en menos de 24h laborables',
  },
  {
    icon: '☎',
    label: 'Teléfono',
    value: '+34 600 100 200',
    sub: 'Lun–Vie · 10:00–18:00 (CET)',
  },
  {
    icon: '📍',
    label: 'Taller',
    value: 'C/ Argumosa 14, 28012 Madrid',
    sub: 'Solo con cita previa',
  },
];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: 'Consulta de producto', mensaje: '' });
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setToast(true);
    setForm({ nombre: '', email: '', asunto: 'Consulta de producto', mensaje: '' });
    setTimeout(() => setToast(false), 2800);
  }

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
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-tinta/10 rounded-2xl p-7"
        >
          <h2 className="font-serif text-2xl text-verde-900 mb-6">Cuéntanos</h2>

          {sent ? (
            <p className="text-verde-700 font-medium py-4">Mensaje enviado — te respondemos pronto ✓</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Nombre</label>
                <input
                  className="input rounded-xl"
                  placeholder="Tu nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Email</label>
                <input
                  className="input rounded-xl"
                  type="email"
                  placeholder="tu@correo.es"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Asunto</label>
                <select
                  className="input rounded-xl"
                  value={form.asunto}
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                >
                  <option>Consulta de producto</option>
                  <option>Asesoría cosmética</option>
                  <option>Pedido B2B / mayorista</option>
                  <option>Curso o taller</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] font-medium text-tinta/50">Mensaje</label>
                <textarea
                  className="input rounded-xl resize-y"
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte…"
                  required
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <button type="submit" className="btn-primary">Enviar mensaje →</button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Mapa placeholder */}
      <div className="mt-14 aspect-[21/8] rounded-2xl overflow-hidden bg-gradient-to-br from-verde-100 to-verde-300 relative flex items-center justify-center">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 50px), repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 50px)'
        }} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-tinta border-4 border-white shadow-lg" />
          <div className="mt-3 bg-white text-tinta text-xs font-medium px-3 py-1.5 rounded-lg shadow-md">
            Argumosa 14, Madrid
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-tinta text-crema-50 text-sm px-5 py-3 rounded-full shadow-lg z-50 animate-fade-up">
          Mensaje enviado — te respondemos pronto ✓
        </div>
      )}
    </div>
  );
}
