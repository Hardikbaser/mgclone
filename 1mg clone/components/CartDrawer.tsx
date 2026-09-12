'use client';

import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../lib/useCartStore';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem } = useCartStore();
  if (!isOpen) return null;
  const itemCount = items.reduce((count, item) => count + (item.quantity || 1), 0);
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  return <><button className={styles.backdrop} aria-label="Close cart" onClick={closeCart} /><aside className={styles.drawer} aria-label="Shopping cart"><header><div><ShoppingBag size={19}/><b>Your cart</b><span>{itemCount} item{itemCount === 1 ? '' : 's'}</span></div><button onClick={closeCart} aria-label="Close cart"><X size={20}/></button></header>{items.length === 0 ? <div className={styles.empty}>Your cart is waiting for something good.</div> : <><div className={styles.items}>{items.map((item) => <div className={styles.item} key={item.id}><div><b>{item.name}</b><small>{item.quantity || 1} × {item.rx ? 'Prescription required' : 'Over-the-counter'}</small></div><strong>₹{item.price * (item.quantity || 1)}</strong><button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><X size={14}/></button></div>)}</div><footer><div><span>Subtotal</span><b>₹{total}</b></div><Link href="/checkout" onClick={closeCart}>Proceed to checkout</Link></footer></>}</aside></>;
}
