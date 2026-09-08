'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Mail } from 'lucide-react';
import styles from '../login/login.module.css';
import { apiFetch } from '../../lib/api';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const [message, setMessage] = useState('Verifying your email address...');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setMessage('This verification link is missing its token.'); return; }
    apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message); setVerified(true); setMessage(payload.message); })
      .catch((error: Error) => setMessage(error.message || 'Unable to verify your email.'));
  }, [params]);

  return <main className={styles.page}><section className={styles.shell}><div className={styles.brandPanel}><div className={styles.brandLogo}><span>1</span>mg</div><p className={styles.kicker}>ACCOUNT SECURITY</p><h1>Email<br/><em>verification.</em></h1></div><div className={styles.formPanel}><div className={styles.formIntro}><p className={styles.kicker}>VERIFY EMAIL</p><h2>{verified ? 'You are verified' : 'Checking your link'}</h2><p>{message}</p></div>{verified ? <Link className={styles.submit} href="/login">Continue to login <Check size={16}/></Link> : <Link className={styles.submit} href="/">Return to home <Mail size={16}/></Link>}</div></section></main>;
}
