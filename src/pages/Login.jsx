import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useGuestStore } from '../store/guestStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  const dest = loc.state?.from?.pathname ?? '/';
  const openGuestForm = useGuestStore((s) => s.openGuestForm);

  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav(dest, { replace: true });
    } catch (e) { setErr('Credenciales inválidas.'); }
  }

  return (
    <div className="container-app py-20 max-w-md">
      <h1 className="font-serif text-4xl text-verde-900 text-center">Bienvenida de nuevo</h1>
      <p className="text-tinta/60 text-center mt-2">Ingresa para acceder a tu cuenta.</p>

      <form onSubmit={submit} className="card p-6 mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
        </div>
        {err && <p className="text-sm text-terracota-400">{err}</p>}
        <button className="btn-primary w-full">Ingresar</button>
        <p className="text-sm text-center text-tinta/60">
          ¿No tienes cuenta? <Link to="/registro" className="text-verde-700 underline">Regístrate</Link>
        </p>
      </form>

      <div className="flex items-center gap-3 mt-6">
        <span className="flex-1 border-t border-crema-200" />
        <span className="text-xs text-tinta/40">o</span>
        <span className="flex-1 border-t border-crema-200" />
      </div>

      <button
        onClick={() => openGuestForm()}
        className="btn-ghost w-full mt-4"
      >
        Continuar como invitada
      </button>
    </div>
  );
}
