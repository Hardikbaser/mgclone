import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = { id: string; name: string; price: number; rx?: boolean };
type Session = { email: string; name: string } | null;

type HealthStore = { cart: CartItem[]; session: Session; add: (item: CartItem) => void; remove: (id: string) => void; setSession: (session: Session) => void; clearSession: () => void };

export const useHealthStore = create<HealthStore>()(persist((set) => ({
 cart: [], session: null,
 add: (item) => set((state) => ({ cart: [...state.cart, item] })),
 remove: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
 setSession: (session) => set({ session }),
 clearSession: () => set({ session: null }),
}), { name: '1mg-health-store' }));
