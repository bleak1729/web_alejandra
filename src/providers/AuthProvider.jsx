import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { readGuestCart, useGuestStore } from '../store/guestStore';
import { mergeGuestCartOnLogin } from '../lib/cart';

export function AuthProvider({ children }) {
  const { setUser, setProfile, setLoading, reset } = useAuthStore();
  const setCartItems = useCartStore((s) => s.setItems);
  const resetCart = useCartStore((s) => s.reset);

  useEffect(() => {
    let unsubProfile = null;
    let unsubCart = null;

    const unsub = onAuthStateChanged(auth, async (user) => {
      unsubProfile?.();
      unsubCart?.();

      if (!user) {
        reset();
        // Carga carrito invitado desde localStorage (sin Firestore)
        const guestItems = readGuestCart();
        setCartItems(guestItems);
        return;
      }

      setUser(user);

      // Al loguearse, fusionar carrito invitado si existe
      await mergeGuestCartOnLogin(user.uid);
      // Limpiar sesión invitado
      useGuestStore.getState().clearGuest();

      const userRef = doc(db, 'usuarios', user.uid);
      unsubProfile = onSnapshot(userRef, async (snap) => {
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            nombre: user.displayName ?? '',
            email: user.email ?? '',
            telefono: '',
            direccion: { calle: '', ciudad: '', pais: '', codigoPostal: '' },
            rol: 'cliente',
            creadoEn: serverTimestamp(),
          });
        } else {
          setProfile(snap.data());
        }
        setLoading(false);
      });

      const cartRef = doc(db, 'carrito', user.uid);
      unsubCart = onSnapshot(cartRef, (snap) => {
        setCartItems(snap.exists() ? snap.data().items ?? [] : []);
      });
    });

    return () => {
      unsub();
      unsubProfile?.();
      unsubCart?.();
    };
  }, [setUser, setProfile, setLoading, reset, setCartItems, resetCart]);

  return children;
}
