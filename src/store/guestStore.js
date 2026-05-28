import { create } from 'zustand';

const GUEST_KEY = 'vc_guest';
const CART_KEY  = 'vc_guest_cart';

function loadGuest() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)); } catch { return null; }
}

export function readGuestCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; } catch { return []; }
}

export function writeGuestCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const useGuestStore = create((set) => ({
  guest: loadGuest(),   // { nombre, apellido, email }
  modalOpen: false,
  directForm: false,    // true → salta paso 1 y abre el formulario directo
  pendingProduct: null,
  pendingCantidad: 1,

  setGuest: (g) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(g));
    set({ guest: g });
  },

  // Abre modal en paso 1 (Ingresar / Continuar como invitada)
  openModal: (producto, cantidad = 1) =>
    set({ modalOpen: true, directForm: false, pendingProduct: producto, pendingCantidad: cantidad }),

  // Abre modal directamente en el formulario (desde Login u otras páginas)
  openGuestForm: (producto = null, cantidad = 0) =>
    set({ modalOpen: true, directForm: true, pendingProduct: producto, pendingCantidad: cantidad }),

  closeModal: () =>
    set({ modalOpen: false, directForm: false, pendingProduct: null, pendingCantidad: 1 }),

  clearGuest: () => {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(CART_KEY);
    set({ guest: null });
  },
}));
