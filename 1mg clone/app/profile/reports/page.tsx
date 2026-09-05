 'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import styles from '../../page.module.css';

export default function ReportsPage() {
 const reports = ['Comprehensive Full Body Checkup', 'Thyroid Profile'];
 const [selected, setSelected] = useState(reports[0]);
 const download = (report: string) => { const file = new Blob([`${report}\nCollected 18 Aug 2026\nPDF report`], { type: 'text/plain' }); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = `${report}.txt`; link.click(); URL.revokeObjectURL(url); };
 return <main className={styles.workflowPage}><Link href="/" className={styles.backLink}><ArrowLeft size={16}/> Back to storefront</Link><div className={styles.workflowHeader}><div><p className={styles.eyebrow}>DIGITAL HEALTH VAULT</p><h1>Your reports</h1><p>Lab results, prescriptions and care history in one secure place.</p></div></div><section className={styles.reportList}>{reports.map((report) => <article className={styles.reportRow} key={report} onClick={() => setSelected(report)}><FileText/><div><b>{report}</b><small>Collected 18 Aug 2026 · PDF report</small></div><button className={styles.iconBtn} aria-label={`Download ${report}`} onClick={(event) => { event.stopPropagation(); download(report); }}><Download size={17}/></button></article>)}</section><div className={styles.pdfPreview}><p className={styles.eyebrow}>REPORT PREVIEW</p><h2>{selected}</h2><div className={styles.pdfSheet}>Your report preview is ready. Select the download icon to save a copy.</div></div></main>;
}
