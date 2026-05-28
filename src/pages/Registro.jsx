import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', pass: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.pass);
      await updateProfile(cred.user, { displayName: form.nombre });
      nav('/', { replace: true });
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="container-app py-20 max-w-md">
      <h1 className="font-serif text-4xl text-verde-900 text-center">Crea tu cuenta</h1>
      <p className="text-tinta/60 text-center mt-2">Únete a la comunidad Vidacosmetic&amp;mas.</p>
      <form onSubmit={submit} className="card p-6 mt-8 space-y-4">
        <div><label className="label">Nombre</label>
          <input className="input" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required/>
        </div>
        <div><label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required/>
        </div>
        <div><label className="label">Contraseña</label>
          <input className="input" type="password" minLength={6} value={form.pass} onChange={(e) => setForm({...form, pass: e.target.value})} required/>
        </div>
        {err && <p className="text-sm text-terracota-400">{err}</p>}
        <button className="btn-primary w-full">Crear cuenta</button>
        <p className="text-sm text-center text-tinta/60">
          ¿Ya tienes cuenta? <Link to="/login" className="text-verde-700 underline">Ingresa</Link>
        </p>
      </form>
    </div>
  );
}
