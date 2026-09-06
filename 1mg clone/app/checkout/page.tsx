'use client';

import Link from 'next/link';
import { ArrowLeft, Check, ChevronRight, CreditCard, LockKeyhole, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../../lib/useCartStore';
import styles from './page.module.css';

const deliveryFee = 49;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal >= 499 ? 50 : 0;
  const total = subtotal + (items.length ? deliveryFee : 0) - discount;

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.brand}><span>1</span>mg</Link><div><LockKeyhole size={15} /> 100% secure checkout</div></header>
    <section className={styles.content}>
      <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Continue shopping</Link>
      <div className={styles.progress} aria-label="Checkout progress"><span className={styles.complete}><Check size={14} /> Cart</span><i /><span className={styles.active}>2. Delivery & payment</span><i /><span>3. Confirmation</span></div>
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardTitle}><div className={styles.icon}><MapPin size={20} /></div><div><p>DELIVERY ADDRESS</p><h1>Where should we deliver?</h1></div><button type="button">Change</button></div>
            <div className={styles.address}><b>Home</b><span>110001, New Delhi</span><small>Your selected city and PIN code will be used for delivery.</small></div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardTitle}><div className={styles.icon}><CreditCard size={20} /></div><div><p>PAYMENT METHOD</p><h2>Choose how you want to pay</h2></div></div>
            <label className={styles.paymentOption}><input type="radio" name="payment" defaultChecked /><span><b>UPI / Cards / Net banking</b><small>Pay securely using your preferred method</small></span><ChevronRight size={18} /></label>
            <label className={styles.paymentOption}><input type="radio" name="payment" /><span><b>Cash on delivery</b><small>Pay at your doorstep</small></span><ChevronRight size={18} /></label>
          </section>
          <section className={styles.trust}><ShieldCheck size={23} /><div><b>Your health information stays private</b><span>Payments are encrypted and prescription orders are pharmacist-verified.</span></div></section>
        </div>
        <aside className={styles.summary}>
          <h2>Order summary</h2>
          {items.length ? <div className={styles.itemList}>{items.map((item, index) => <div className={styles.item} key={`${item.id}-${index}`}><span><b>{item.name}</b><small>{item.rx ? 'Prescription required' : 'OTC medicine'}</small></span><strong>₹{item.price}</strong></div>)}</div> : <div className={styles.empty}>Your cart is empty. Add items to continue.</div>}
          <div className={styles.bill}><div><span>Item total</span><b>₹{subtotal}</b></div><div><span>Delivery fee</span><b>₹{items.length ? deliveryFee : 0}</b></div>{discount > 0 && <div className={styles.saving}><span>Extra savings</span><b>− ₹{discount}</b></div>}<div className={styles.total}><span>To pay</span><b>₹{total}</b></div></div>
          <button className={styles.payButton} disabled={!items.length}>Proceed to payment <ChevronRight size={18} /></button>
          <p className={styles.safe}><LockKeyhole size={13} /> Safe and secure payments</p>
        </aside>
      </div>
      <div className={styles.delivery}><Truck size={21} /><span><b>Fast, careful delivery</b><small>Most eligible orders arrive within 24–48 hours.</small></span></div>
    </section>
  </main>;
}
