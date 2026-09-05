import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import styles from '../page.module.css';

export default function CheckoutPage() { return <main className={styles.workflowPage}><Link href="/" className={styles.backLink}><ArrowLeft size={16}/> Continue shopping</Link><section className={styles.workflowCard}><p className={styles.eyebrow}>SECURE CHECKOUT</p><h1>Complete your order.</h1><p>OTC items can be dispatched immediately. Orders containing prescription medicines enter <b>PENDING_VERIFICATION</b> until our pharmacist reviews the prescription.</p><div className={styles.checkoutRows}><div><ShieldCheck/><span>Encrypted payment and verified pharmacy partners</span></div><button className={styles.darkBtn}>Proceed to payment</button></div></section></main>; }
