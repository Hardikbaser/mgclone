'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useHealthStore } from '../lib/store';
import styles from '../app/page.module.css';

export function UserAuthButton() {
 const session = useHealthStore((state) => state.session); const setSession = useHealthStore((state) => state.setSession); const clearSession = useHealthStore((state) => state.clearSession);
 useEffect(() => { if (!supabase) return; const { data } = supabase.auth.onAuthStateChange((_event, authSession) => { if (!authSession?.user) { clearSession(); return; } setSession({ email: authSession.user.email ?? '', name: String(authSession.user.user_metadata?.name ?? authSession.user.email?.split('@')[0] ?? 'Member') }); }); return () => data.subscription.unsubscribe(); }, [clearSession, setSession]);
 const logout = async () => { await supabase?.auth.signOut(); document.cookie = '1mg-demo-session=; path=/; max-age=0'; clearSession(); };
 if (!session) return <Link className={styles.account} href="/login"><UserRound size={18}/> Login</Link>;
 return <button className={styles.account} onClick={logout} title="Log out"><UserRound size={18}/> {session.name} <LogOut size={14}/></button>;
}
