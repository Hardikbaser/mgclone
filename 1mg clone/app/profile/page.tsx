'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, readApiError } from '../../lib/api';

function ProfileContent() {
  const section = useSearchParams().get('section');
  const [user, setUser] = useState<{name:string;email:string}|null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    apiFetch('/auth/me').then(async response => {
      if (!response.ok) throw Error(await readApiError(response, 'Unable to load your profile.'));
      return response.json();
    }).then(data => { if (active) setUser(data.user); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  const panels: Record<string, {title:string;description:string;href:string;action:string}> = {
    reviews: {title:'Rate your Recent Purchases',description:'Purchase ratings are not available in this application yet. You can view your recent purchases in Your orders.',href:'/orders',action:'View your orders'},
    payments: {title:'Manage Payments',description:'Payment details are entered securely during checkout. This application does not store cards or support saved payment methods. Your orders show the purchases you have placed.',href:'/orders',action:'View your orders'},
    cash: {title:'1mg Cash',description:'A cash wallet is not connected to this application. No wallet balance or credits are available.',href:'/products',action:'Continue shopping'},
  };
  const panel = section ? panels[section] : null;
  return <main className="container section" style={{maxWidth:900,minHeight:400}}>
    <h1>{panel?.title || 'My Profile'}</h1>
    {error ? <p className="error-box" role="alert">{error} <Link href="/login?next=/profile">Login</Link></p> : !user ? <p>Loading your account...</p> : panel ? <section className="info-card"><p>{panel.description}</p><Link className="primary-button" href={panel.href}>{panel.action}</Link></section> : <section className="info-card"><h2>{user.name}</h2><p>{user.email}</p><div style={{display:'flex',flexWrap:'wrap',gap:12}}><Link className="primary-button" href="/orders">Your orders</Link><Link className="outline-button" href="/profile/reports">My Health Records</Link><Link className="outline-button" href="/care-plan">Care Plan</Link></div></section>}
  </main>;
}
export default function ProfilePage(){return <Suspense fallback={<main className="container section">Loading your account...</main>}><ProfileContent/></Suspense>}
