import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '../components/SiteChrome';
import { CartDrawer } from '../components/CartDrawer';
import { CartSessionSync } from '../components/CartSessionSync';

export const metadata: Metadata = { title: 'Tata 1mg | Healthcare for all', description: 'Medicines, lab tests and doctor consultations' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" data-scroll-behavior="smooth"><body><CartSessionSync /><SiteChrome>{children}</SiteChrome><CartDrawer /></body></html>; }
