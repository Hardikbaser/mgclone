'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useHealthStore } from '../lib/store';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../lib/useCartStore';
import styles from '../app/page.module.css';

export function UserAuthButton() {
 const session = useHealthStore((state) => state.session); const clearSession = useHealthStore((state) => state.clearSession); const clearCart = useCartStore((state) => state.clearCart); const router = useRouter();
 // Product and health-concern cards are presentation-only in this clone.
 // Prevent copied 1mg URLs from taking visitors to the original website.
 useEffect(() => {
  const keepExternalOneMgLinksStatic = (event: MouseEvent) => {
   if (!(event.target instanceof Element)) return;
   const link = event.target.closest('a[href]') as HTMLAnchorElement | null;
   if (!link) return;
   const destination = new URL(link.href, window.location.href);
   if (destination.hostname.endsWith('1mg.com')) {
    event.preventDefault();
    event.stopPropagation();
   }
  };
  document.addEventListener('click', keepExternalOneMgLinksStatic, true);
  return () => document.removeEventListener('click', keepExternalOneMgLinksStatic, true);
 }, []);
 const logout = async () => { try { await apiFetch('/auth/logout', { method: 'POST' }); } finally { clearSession(); clearCart(); router.push('/login'); } };
 if (!session) return <Link className={styles.account} href="/login"><UserRound size={18}/> Login</Link>;
 return <button className={styles.account} onClick={logout} title="Log out"><UserRound size={18}/> {session.name} <LogOut size={14}/></button>;
}
