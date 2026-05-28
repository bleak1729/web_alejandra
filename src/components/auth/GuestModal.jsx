import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGuestStore } from '../../store/guestStore';
import { addToCart } from '../../lib/cart';

export default function GuestModal() {
  const { modalOpen, directForm, pendingProduct, pendingCantidad, closeModal, setGuest } = useGuestStore();
  const [showFormLocal, setShowFormLocal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  if (!modalOpen) return null;

  // directForm salta el paso 1 (elección) e inicia en el formulario
  const showForm = directForm || showFormLocal;

  function handleClose() {
    setShowFormLocal(false);
    setNombre(''); setApellido(''); setEmail('');
    closeModal();
  }

  function handleLogin() {
    handleClose();
    nav('/login', { state: { from: loc } });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setGuest({ nombre, apellido, email });
    if (pendingProduct) {
      await addToCart(pendingProduct, pendingCantidad);
      handleClose();
      nav('/carrito');
    } else {
      // Vino desde "Proceder al pago" — ir directo al checkout
      handleClose();
      nav('/checkout');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay-medium)' }}
    >
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-5 text-2xl leading-none text-tinta/30 hover:text-tinta transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>

        <p className="eyebrow mb-2">
          {pendingProduct ? 'Para agregar al carrito' : 'Para completar tu compra'}
        </p>
        <h2 className="font-serif text-2xl text-verde-900 mb-6">¿Cómo quieres continuar?</h2>

        {!showForm ? (
          <div className="space-y-3">
            <button onClick={handleLogin} className="btn-primary w-full">
              Ingresar
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="flex-1 border-t border-crema-200" />
              <span className="text-xs text-tinta/40">o</span>
              <span className="flex-1 border-t border-crema-200" />
            </div>

            <button onClick={() => setShowFormLocal(true)} className="btn-ghost w-full">
              Continuar como invitada
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-tinta/60 -mt-2 mb-2">
              Solo para gestionar tu pedido. Sin crear cuenta.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input
                  className="input"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="María"
                />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  className="input"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="García"
                />
              </div>
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Cargando…' : pendingProduct ? 'Agregar al carrito' : 'Continuar'}
            </button>

            {!directForm && (
              <button
                type="button"
                onClick={() => setShowFormLocal(false)}
                className="w-full text-xs text-tinta/40 hover:text-tinta/70 transition-colors"
              >
                ← Volver
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
