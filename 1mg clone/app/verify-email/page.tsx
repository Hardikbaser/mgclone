'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Check, Mail } from 'lucide-react';
import styles from '../login/login.module.css';
import { apiFetch } from '../../lib/api';

function VerifyEmailContent() {
  const params = useSearchParams();
  const [message, setMessage] = useState('Verifying your email address...');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) return;
    apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message); setVerified(true); setMessage(payload.message); })
      .catch((error: Error) => setMessage(error.message || 'Unable to verify your email.'));
  }, [params]);

  return <main className="container section"><section className="info-card" style={{maxWidth:600,margin:'40px auto',textAlign:'center'}}><Mail size={40} color="#ff6f61"/><h1>{verified?'Email verified':'Email verification'}</h1><p role="status">{params.get("token")?message:"This verification link is missing its token."}</p><Link className="primary-button" href={verified?'/login':'/'}>{verified?'Continue to login':'Return home'}</Link></section></main>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className={styles.page}>Verifying your email address…</main>}><VerifyEmailContent /></Suspense>;
}
