'use client';

import { useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useCartStore } from '../lib/useCartStore';
import { useHealthStore } from '../lib/store';

/** Restores the authenticated user's server-side cart on every new browser session. */
export function CartSessionSync() {
  const setSession = useHealthStore((state) => state.setSession);
  const clearSession = useHealthStore((state) => state.clearSession);
  const setAuthReady = useHealthStore((state) => state.setAuthReady);
  const loadCart = useCartStore((state) => state.loadCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const response = await apiFetch('/auth/me');
        if (!response.ok) throw new Error('No active session');
        const payload = await response.json() as { user: { email: string; name: string } };
        await loadCart();
        if (active) setSession({ email: payload.user.email, name: payload.user.name });
      } catch {
        if (active) {
          clearSession();
          clearCart();
        }
      } finally {
        if (active) setAuthReady();
      }
    };

    void restoreSession();
    return () => { active = false; };
  }, [clearCart, clearSession, loadCart, setAuthReady, setSession]);

  return null;
}
