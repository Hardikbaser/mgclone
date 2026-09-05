import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = { id: string; name: string; price: number; rx?: boolean; image?: string };
type CartStore = { items: CartItem[]; isOpen: boolean; openCart: () => void; closeCart: () => void; toggleCart: () => void; addItem: (item: CartItem) => void; removeItem: (id: string) => void; setItemQuantity: (item: CartItem, quantity: number) => void };

export const useCartStore = create<CartStore>()(persist((set) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  addItem: (item) => set((state) => ({ items: [...state.items, item], isOpen: true })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  setItemQuantity: (item, quantity) => set((state) => ({
    items: [...state.items.filter((currentItem) => currentItem.id !== item.id), ...Array.from({ length: Math.max(0, quantity) }, () => item)],
    isOpen: quantity > 0 ? true : state.isOpen,
  })),
}), { name: '1mg-cart' }));
