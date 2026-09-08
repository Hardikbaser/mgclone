import { create } from 'zustand';
type CartItem = { id: string; name: string; price: number; rx?: boolean };
type Session = { email: string; name: string } | null;

type HealthStore = { cart: CartItem[]; session: Session; authReady: boolean; add: (item: CartItem) => void; remove: (id: string) => void; setSession: (session: Session) => void; clearSession: () => void; setAuthReady: () => void };

export const useHealthStore = create<HealthStore>()((set) => ({
 cart: [], session: null, authReady: false,
 add: (item) => set((state) => ({ cart: [...state.cart, item] })),
 remove: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
 setSession: (session) => set({ session }),
 clearSession: () => set({ session: null }),
 setAuthReady: () => set({ authReady: true }),
}));
