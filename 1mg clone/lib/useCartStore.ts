import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch, readApiError } from './api';

export type CartItem = { id: string; name: string; price: number; rx?: boolean; image?: string };
type CartStore = { items: CartItem[]; isOpen: boolean; openCart: () => void; closeCart: () => void; toggleCart: () => void; loadCart: () => Promise<void>; clearCart: () => void; addItem: (item: CartItem) => Promise<void>; removeItem: (id: string) => Promise<void>; setItemQuantity: (item: CartItem, quantity: number) => Promise<void> };

export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  loadCart: async () => {
    const response = await apiFetch('/cart');
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to load your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set({ items: payload.items });
  },
  clearCart: () => set({ items: [] }),
  addItem: async (item) => {
    const items = [...get().items, item];
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set({ items: payload.items, isOpen: true });
  },
  removeItem: async (id) => {
    const items = get().items.filter((item) => item.id !== id);
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set({ items: payload.items });
  },
  setItemQuantity: async (item, quantity) => {
    const items = [...get().items.filter((currentItem) => currentItem.id !== item.id), ...Array.from({ length: Math.max(0, quantity) }, () => item)];
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set((state) => ({ items: payload.items, isOpen: quantity > 0 ? true : state.isOpen }));
  },
}), { name: '1mg-cart-ui', partialize: (state) => ({ isOpen: state.isOpen }) }));
