import type { CartItem } from './useCartStore';
export function cartPricing(items: CartItem[]) {
  const products = items.filter(item => item.kind !== 'care-plan');
  const sum = (list: CartItem[]) => list.reduce((total, item) => total + Math.round(item.price * 100) * (item.quantity || 1), 0) / 100;
  const subtotal = sum(items);
  const deliveryFee = products.length ? 49 : 0;
  const discount = sum(products) >= 499 ? 50 : 0;
  return { subtotal, deliveryFee, discount, total: Math.round((subtotal + deliveryFee - discount) * 100) / 100 };
}
