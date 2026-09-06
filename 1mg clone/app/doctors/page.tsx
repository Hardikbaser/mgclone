'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, ChevronDown, Star, Video } from 'lucide-react';
import { useState } from 'react';
import styles from '../page.module.css';
import faqStyles from './page.module.css';

const doctors = [{ name: 'Dr. Meera Sharma', specialty: 'General Physician', experience: '14 years', fee: 399, rating: 4.9 }, { name: 'Dr. Rohan Kapoor', specialty: 'Dermatologist', experience: '11 years', fee: 599, rating: 4.8 }, { name: 'Dr. Ananya Iyer', specialty: 'Paediatrician', experience: '16 years', fee: 499, rating: 4.9 }];

const faqs = [
  ['Can I consult a doctor online for my symptoms?', 'Yes. You can describe your symptoms and share relevant medical information with the doctor. The doctor can assess the information you provide and guide you on the appropriate next steps.'],
  ['What information should I share during my consultation?', 'Share your main symptoms, when they started, any existing medical conditions, medicines you are currently taking, allergies, and any relevant medical reports or prescriptions.'],
  ['Can I share my previous medical reports or prescription?', 'Yes. If document sharing is available in the consultation, you can upload relevant reports or previous prescriptions to help the doctor understand your medical history.'],
  ['Can the doctor prescribe medicines after the consultation?', "If appropriate, the doctor may provide a prescription after evaluating your symptoms and medical information. The decision to prescribe is based on the doctor's clinical assessment."],
  ['How do I choose the right doctor for my problem?', 'You can browse doctors by specialty, health concern, experience, and availability. If you are unsure which specialist to choose, a general physician can help assess your concern and guide you further.'],
  ['Can I consult a doctor for a family member?', 'Yes, where supported by the service. Provide accurate information about the person being consulted, including their age, symptoms, existing conditions, and current medicines.'],
  ['Can I ask questions during the consultation?', 'Yes. You can discuss your concerns with the doctor and ask questions related to your symptoms, treatment, medicines, or recommended next steps.'],
  ['Is my consultation information private?', "Your consultation and personal information should be handled according to the website's privacy and security practices. Only provide information necessary for your consultation."],
  ['What happens if I miss my scheduled consultation?', 'The available options depend on the consultation and appointment policy. If you miss an appointment, check your booking details for rescheduling or contact support if assistance is required.'],
  ['Can I get medical help for an emergency through online consultation?', 'Online consultation is not intended to replace emergency medical care. If you are experiencing severe or potentially life-threatening symptoms, seek immediate emergency medical assistance.'],
];

export default function DoctorsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => setOpenFaq((current) => current === index ? null : index);

  return <main className={styles.workflowPage}>
    <Link href="/" className={styles.backLink}><ArrowLeft size={16}/> Back to storefront</Link>
    <div className={styles.workflowHeader}><div><p className={styles.eyebrow}>TELECONSULTATION</p><h1>Find your doctor</h1><p>Search by specialty and book a private video consultation.</p></div><button className={styles.darkBtn}><Video size={16}/> Available now</button></div>
    <div className={styles.directoryFilters}><input placeholder="Search specialty or doctor"/><select defaultValue="all"><option value="all">All specialties</option><option>General Physician</option><option>Dermatologist</option></select><select defaultValue="rating"><option value="rating">Highest rated</option><option value="fee">Lowest fee</option></select></div>
    <section className={styles.directoryGrid}>{doctors.map((doctor) => <article className={styles.directoryCard} key={doctor.name}><div className={styles.avatar}>{doctor.name.split(' ').map((word) => word[0]).join('')}</div><h2>{doctor.name}</h2><p>{doctor.specialty}</p><span>{doctor.experience} · <Star size={13}/> {doctor.rating}</span><div><b>₹{doctor.fee}</b><Link href="/consultation/demo" className={styles.addBtn}>Book slot <CalendarDays size={15}/></Link></div></article>)}</section>
    <section className={faqStyles.faqSection} aria-labelledby="faq-heading"><div className={faqStyles.faqIntro}><h2 id="faq-heading">Frequently Asked Questions</h2><p>Have questions about online doctor consultations? Find answers to some of the most common questions below.</p></div><div className={faqStyles.faqList}>{faqs.map(([question, answer], index) => { const isOpen = openFaq === index; const answerId = `doctor-faq-answer-${index}`; return <article className={`${faqStyles.faqItem} ${isOpen ? faqStyles.open : ''}`} key={question}><button type="button" className={faqStyles.faqButton} onClick={() => toggleFaq(index)} aria-expanded={isOpen} aria-controls={answerId}><span>{question}</span><ChevronDown size={20} aria-hidden="true" /></button><div id={answerId} className={faqStyles.answerWrap} aria-hidden={!isOpen}><div className={faqStyles.answer}><p>{answer}</p></div></div></article>; })}</div></section>
  </main>;
}
