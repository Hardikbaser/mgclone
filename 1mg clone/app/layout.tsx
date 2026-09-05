import type { Metadata } from 'next';
import './globals.css';
import './workflow.css';
import { CartDrawer } from '../components/CartDrawer';

export const metadata: Metadata = { title: 'Tata 1mg | Healthcare for all', description: 'Medicines, lab tests and doctor consultations' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<CartDrawer /></body></html>; }
