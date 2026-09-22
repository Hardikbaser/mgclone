import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch, readApiError } from './api';

export type CartItem = { id: string; name: string; price: number; quantity?: number; rx?: boolean; image?: string; kind?: string; durationMonths?: number };
type CartStore = { items: CartItem[]; isOpen: boolean; openCart: () => void; closeCart: () => void; toggleCart: () => void; loadCart: () => Promise<void>; clearCart: () => void; addItem: (item: CartItem) => Promise<void>; removeItem: (id: string) => Promise<void>; setItemQuantity: (item: CartItem, quantity: number) => Promise<void> };

const normalizeItems = (items: CartItem[]) => Object.values(items.reduce<Record<string, CartItem>>((result, item) => {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const existing = result[item.id];
  result[item.id] = existing ? { ...existing, quantity: (existing.quantity || 1) + quantity } : { ...item, quantity };
  return result;
}, {}));

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
    set({ items: normalizeItems(payload.items) });
  },
  clearCart: () => set({ items: [] }),
  addItem: async (item) => {
    const current = item.kind === 'care-plan' ? get().items.filter(i => i.kind !== 'care-plan') : get().items;
    const items = normalizeItems([...current, { ...item, quantity: item.kind === 'care-plan' ? 1 : item.quantity || 1 }]);
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set({ items: normalizeItems(payload.items), isOpen: true });
  },
  removeItem: async (id) => {
    const items = get().items.filter((item) => item.id !== id);
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set({ items: normalizeItems(payload.items) });
  },
  setItemQuantity: async (item, quantity) => {
    const items = quantity > 0
      ? [...get().items.filter((currentItem) => currentItem.id !== item.id), { ...item, quantity }]
      : get().items.filter((currentItem) => currentItem.id !== item.id);
    const response = await apiFetch('/cart', { method: 'PUT', body: { items } });
    if (!response.ok) throw new Error(await readApiError(response, 'Unable to update your cart.'));
    const payload = await response.json() as { items: CartItem[] };
    set((state) => ({ items: normalizeItems(payload.items), isOpen: quantity > 0 ? true : state.isOpen }));
  },
}), { name: '1mg-cart-ui', partialize: (state) => ({ isOpen: state.isOpen }) }));
