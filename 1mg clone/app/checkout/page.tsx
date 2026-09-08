'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, CreditCard, LockKeyhole, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../../lib/useCartStore';
import { apiFetch, readApiError } from '../../lib/api';
import styles from './page.module.css';

const deliveryFee = 49;
type Address = { label: string; name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string };
const blankAddress: Address = { label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };
type RazorpaySuccess = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayOrder = { keyId: string; order: { id: string; amount: number; currency: string } };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const [address, setAddress] = useState<Address>(blankAddress);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal >= 499 ? 50 : 0;
  const total = subtotal + (items.length ? deliveryFee : 0) - discount;
  const updateAddress = (field: keyof Address, value: string) => setAddress((current) => ({ ...current, [field]: value }));
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const response = await apiFetch('/account/address');
        if (!response.ok) return;
        const payload = await response.json() as { address: Address | null };
        if (payload.address) setAddress({ ...blankAddress, ...payload.address });
      } catch { /* An unsigned-in visitor simply sees a blank checkout form. */ }
    };
    void loadSavedAddress();
  }, []);
  const validAddress = () => {
    if (!address.name.trim() || !address.phone.match(/^\d{10}$/) || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.match(/^\d{6}$/)) {
      setMessage('Enter your name, 10-digit phone number, complete address, city, state, and 6-digit PIN code.');
      return false;
    }
    return true;
  };
  const createOrder = async (method: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY') => {
    setPlacingOrder(true); setMessage('');
    try {
      const response = await apiFetch('/orders', { method: 'POST', body: { items, totalAmount: total, paymentMethod: method, deliveryAddress: address } });
      if (response.status === 401) { router.push('/login?next=/checkout'); return; }
      if (!response.ok) throw new Error(await readApiError(response, 'Unable to place your order.'));
      const payload = await response.json() as { order: { id: string } };
      // The order is already stored; a cart-sync failure should not hide its confirmation.
      try { await apiFetch('/cart', { method: 'PUT', body: { items: [] } }); } catch { /* local cart is still cleared below */ }
      clearCart(); setOrderId(payload.order.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to place your order.'); }
    finally { setPlacingOrder(false); }
  };
  const saveAddress = async () => {
    try {
      const response = await apiFetch('/account/address', { method: 'PUT', body: { address } });
      if (response.status === 401) { router.push('/login?next=/checkout'); return false; }
      if (!response.ok) throw new Error(await readApiError(response, 'Unable to save your delivery address.'));
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save your delivery address.'); return false; }
  };
  const startRazorpayPayment = async () => {
    setPlacingOrder(true); setMessage('');
    try {
      const orderResponse = await apiFetch('/payments/razorpay/order', { method: 'POST', body: { amount: total } });
      if (orderResponse.status === 401) { router.push('/login?next=/checkout'); return; }
      if (!orderResponse.ok) throw new Error(await readApiError(orderResponse, 'Unable to start the payment.'));
      const razorpay = await loadRazorpay();
      if (!razorpay || !window.Razorpay) throw new Error('Unable to load the secure payment window. Check your internet connection and try again.');
      const payload = await orderResponse.json() as RazorpayOrder;
      const method = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'CARD' : 'NET_BANKING';
      const checkout = new window.Razorpay({ key: payload.keyId, amount: payload.order.amount, currency: payload.order.currency, name: 'Tata 1mg', description: 'Medicine order', order_id: payload.order.id, prefill: { name: address.name, contact: address.phone }, theme: { color: '#ff6f61' }, handler: async (result: RazorpaySuccess) => {
        try {
          const verification = await apiFetch('/payments/razorpay/verify', { method: 'POST', body: result });
          if (!verification.ok) throw new Error(await readApiError(verification, 'Payment verification failed.'));
          await createOrder(method);
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Payment verification failed.'); setPlacingOrder(false); }
      }, modal: { ondismiss: () => setPlacingOrder(false) } });
      checkout.open();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to start the payment.'); setPlacingOrder(false); }
  };
  const beginCheckout = async (event: FormEvent) => { event.preventDefault(); if (!items.length || !validAddress() || !await saveAddress()) return; if (paymentMethod === 'cod') void createOrder('CASH_ON_DELIVERY'); else void startRazorpayPayment(); };

  if (orderId) return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.brand}><span>1</span>mg</Link><div><LockKeyhole size={15} /> Secure checkout</div></header><section className={styles.confirmation}><span className={styles.confirmIcon}><Check size={30} /></span><p>ORDER CONFIRMED</p><h1>Thank you, {address.name}.</h1><h2>Your order is being prepared.</h2><small>Order ID: {orderId}</small><div><b>{paymentMethod === 'cod' ? 'Cash on delivery selected' : 'Payment successful'}</b><span>Delivering to {address.line1}, {address.city} — {address.pincode}</span></div><Link className={styles.payButton} href="/">Continue shopping <ChevronRight size={18} /></Link></section></main>;

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.brand}><span>1</span>mg</Link><div><LockKeyhole size={15} /> 100% secure checkout</div></header>
    <section className={styles.content}>
      <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Continue shopping</Link>
      <div className={styles.progress} aria-label="Checkout progress"><span className={styles.complete}><Check size={14} /> Cart</span><i /><span className={styles.active}>2. Delivery & payment</span><i /><span>3. Confirmation</span></div>
      <form className={styles.layout} onSubmit={beginCheckout}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardTitle}><div className={styles.icon}><MapPin size={20} /></div><div><p>DELIVERY ADDRESS</p><h1>Where should we deliver?</h1></div></div>
            <div className={styles.addressForm}>
              <div className={styles.fieldRow}><label>Address label<select value={address.label} onChange={(event) => updateAddress('label', event.target.value)}><option>Home</option><option>Work</option><option>Other</option></select></label><label>Full name<input required value={address.name} onChange={(event) => updateAddress('name', event.target.value)} placeholder="Recipient name" /></label></div>
              <div className={styles.fieldRow}><label>Phone number<input required inputMode="numeric" pattern="[0-9]{10}" value={address.phone} onChange={(event) => updateAddress('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" /></label><label>PIN code<input required inputMode="numeric" pattern="[0-9]{6}" value={address.pincode} onChange={(event) => updateAddress('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digits" /></label></div>
              <label>Address line 1<input required value={address.line1} onChange={(event) => updateAddress('line1', event.target.value)} placeholder="House / flat number, building, street" /></label>
              <label>Address line 2 <em>(optional)</em><input value={address.line2} onChange={(event) => updateAddress('line2', event.target.value)} placeholder="Area, landmark" /></label>
              <div className={styles.fieldRow}><label>City<input required value={address.city} onChange={(event) => updateAddress('city', event.target.value)} placeholder="City" /></label><label>State<input required value={address.state} onChange={(event) => updateAddress('state', event.target.value)} placeholder="State" /></label></div>
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardTitle}><div className={styles.icon}><CreditCard size={20} /></div><div><p>PAYMENT METHOD</p><h2>Choose how you want to pay</h2></div></div>
            <label className={styles.paymentOption}><input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /><span><b>UPI</b><small>Pay using any UPI app</small></span><ChevronRight size={18} /></label>
            <label className={styles.paymentOption}><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><span><b>Credit / Debit Card</b><small>Visa, Mastercard, RuPay and more</small></span><ChevronRight size={18} /></label>
            <label className={styles.paymentOption}><input type="radio" name="payment" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} /><span><b>Net Banking</b><small>Pay directly from your bank account</small></span><ChevronRight size={18} /></label>
            <label className={styles.paymentOption}><input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /><span><b>Cash on delivery</b><small>Pay at your doorstep</small></span><ChevronRight size={18} /></label>
          </section>
          <section className={styles.trust}><ShieldCheck size={23} /><div><b>Your health information stays private</b><span>Card, UPI, and bank details are entered only in Razorpay's secure checkout.</span></div></section>
        </div>
        <aside className={styles.summary}><h2>Order summary</h2>{items.length ? <div className={styles.itemList}>{items.map((item, index) => <div className={styles.item} key={`${item.id}-${index}`}><span><b>{item.name}</b><small>{item.rx ? 'Prescription required' : 'OTC medicine'}</small></span><strong>₹{item.price}</strong></div>)}</div> : <div className={styles.empty}>Your cart is empty. Add items to continue.</div>}<div className={styles.bill}><div><span>Item total</span><b>₹{subtotal}</b></div><div><span>Delivery fee</span><b>₹{items.length ? deliveryFee : 0}</b></div>{discount > 0 && <div className={styles.saving}><span>Extra savings</span><b>− ₹{discount}</b></div>}<div className={styles.total}><span>To pay</span><b>₹{total}</b></div></div><button className={styles.payButton} type="submit" disabled={!items.length || placingOrder}>{placingOrder ? 'Placing order…' : paymentMethod === 'cod' ? 'Place COD order' : 'Proceed to pay'} <ChevronRight size={18} /></button><p className={styles.safe}><LockKeyhole size={13} /> Safe and secure payments</p>{message && <p className={styles.error}>{message}</p>}</aside>
      </form>
      <div className={styles.delivery}><Truck size={21} /><span><b>Fast, careful delivery</b><small>Most eligible orders arrive within 24–48 hours.</small></span></div>
    </section>
  </main>;
}
