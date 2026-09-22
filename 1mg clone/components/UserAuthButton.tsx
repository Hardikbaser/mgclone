'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHealthStore } from '../lib/store';
import { useCartStore } from '../lib/useCartStore';
import { apiFetch, readApiError } from '../lib/api';
import styles from './UserAuthButton.module.css';
const entries = [
 ['View Profile','/profile',''],
 ['My Orders','/orders',''],
 ['Previously Ordered Items','/orders','NEW'],
 ['Rate your Recent Purchases','/profile?section=reviews','NEW'],
 ['My Lab Tests','/labs',''],
 ['My Consultations','/doctors',''],
 ['My Health Records','/profile/reports','NEW'],
 ['Manage Payments','/profile?section=payments',''],
 ['Care Plan','/care-plan','SAVEMORE'],
 ['1mg Cash','/profile?section=cash',''],
];
export function UserAuthButton(){
 const session=useHealthStore(s=>s.session),clear=useHealthStore(s=>s.clearSession),router=useRouter(),path=usePathname();
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const wrapper=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!wrapper.current?.contains(event.target as Node))setOpen(false)};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)};
 },[open]);
 async function logout(){setBusy(true);setError('');try{const response=await apiFetch('/auth/logout',{method:'POST'});if(!response.ok&&response.status!==401)throw Error(await readApiError(response,'Unable to log out. Please try again.'));clear();useCartStore.getState().clearCart();useCartStore.getState().closeCart();setOpen(false);router.push('/login')}catch(e){setError(e instanceof Error?e.message:'Unable to log out.')}finally{setBusy(false)}}
 if(!session)return <div className={styles.guest}><Link href="/login">Login</Link><span aria-hidden="true">|</span><Link href="/login?mode=signup">Signup</Link></div>;
 return <div className={styles.account} ref={wrapper} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false)}}>
  <button ref={trigger} className={styles.trigger} type="button" aria-label="Account menu" aria-expanded={open} aria-controls="account-dropdown" onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);requestAnimationFrame(()=>wrapper.current?.querySelector<HTMLAnchorElement>('nav a')?.focus())}}}>
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21v-1.6c0-1.1.6-2.1 1.6-2.6l2.8-1.5c.7-.4 1.1-1.1 1.1-1.9v-.7c-1.1-.9-1.7-2.3-1.7-3.8V6.7C7.8 4.1 9.3 2.5 12 2.5s4.2 1.6 4.2 4.2v2.2c0 1.5-.6 2.9-1.7 3.8v.7c0 .8.4 1.5 1.1 1.9l2.8 1.5c1 .5 1.6 1.5 1.6 2.6V21" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {open&&<div id="account-dropdown" className={styles.dropdown}><div className={styles.greeting}>Hi, there</div><nav aria-label="Your account">{entries.map(([label,href,badge])=><Link key={label} href={href} onClick={()=>setOpen(false)} aria-current={path===href?'page':undefined}>{label}{badge&&<span className={styles.badge}>{badge}</span>}</Link>)}<button type="button" disabled={busy} onClick={logout}>{busy?'Logging out...':'Logout'}</button></nav>{error&&<p role="alert" className={styles.error}>{error}</p>}</div>}
 </div>;
}
