'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, LocateFixed, MapPin, Pause, Play, Search, X } from 'lucide-react';
import images from './images.json';
import styles from './labs.module.css';

const image = (name: string) => (images as Record<string, string>)[name];
const tests = [{name:'Full Body Checkup',price:1499},{name:'Thyroid Profile',price:499},{name:'Vitamin D Test',price:899},{name:'Diabetes Screening',price:399}];
const needs = [['Men','1759780332_Men+(1).png','Full Body'],['Women','1759780339_women+(1).png','Full Body'],['Liver & Kidney','1759780346_Liver+(1).png','Liver'],['Thyroid','1759780351_Thyroid+(1).png','Thyroid'],['Hormones','1759780357_headache+(1).png','Hormones'],['Allergy','1759780361_Allergy+(1).png','Allergy']];
const categories = [['Full Body Packages','5bb6fe58-8319-4f00-8144-53e7ddb61e29.png','Full Body'],['X Rays, Scans & More','38f3b0ab-44a9-40cb-9a17-5625223db1a9.png','radiology'],['Fever Tests','82807d21-cd7f-4806-9c29-428d1762e971.png','Fever'],['Diabetes Tests','a2d1460e-9556-4f69-9777-8bedcc21a40e.png','Diabetes'],['Vitamins Tests','dbae7046-936a-4772-99b7-83fb4eb41b28.png','Vitamin']];
const scans = [['CT Scan','1787556349_CT+Scan.png'],['ECG','1787556355_ECG.png'],['X-Ray','1787556362_X-Ray.png'],['Ultrasound','1787556442_Ultrasound.png'],['MRI','1787556448_MRI.png'],['Echo Test','1787556454_Echo.png']];
const stories = [['NABL Labs','1759774842_Image+8709f0a2.png','https://www.1mg.com/information/Labs-Accreditation'],['CAP Accredited','1759774744_Image+798cf530.png','https://www.1mg.com/information/tata-1mg-national-reference-lab'],['Bharose ka Badge','1759774867_Image+from+FreeConvert+(2).png','https://www.youtube.com/watch?v=P1qE-YK4WoA'],['Trust what you see','1759774874_Image+1721621225+(2).png','https://www.youtube.com/watch?v=CLELFdw4Ec0']];
const steps = [
  ['Easy online booking','1759764075_1.png','Search for tests and packages, book your preferred time slot and enter your address for seamless at-home lab tests.'],
  ['Live tracking of phlebotomist','1759764135_2.png',"Track our trained phlebotomist's real time location for seamless sample collection."],
  ['Safe Sample Collection','1759764179_3.png','Our phlebotomists follow strict safety protocols to collect samples safely at home and on time.'],
  ['Sample received at lab','1759764218_4.png','Samples are transported securely to our accredited labs with world-class machines for testing by qualified experts.'],
  ['Quick, Doctor-Verified Reports','1759764257_5.png','Get doctor-approved reports via email and WhatsApp, with options for doctor follow-ups and AI insights.'],
];
const photos = [
  ['2961d7e2-222c-454b-82b1-7d0b9b48ba39.png','Trusted NABL certified labs','Hygienic & safety assured testing'],
  ['ffac84c5-faa5-4d09-84ce-d65afc3a9b6a.png','Home sample collection','Safe pickup at your doorstep'],
  ['bb456593-c796-41e9-a9b7-39a4fcc8d4cf.jpg','Wide coverage across india','Most trusted service in 55+ cities'],
  ['996a2f61-77ba-4ec3-a66d-437434364eb1.JPG','Fast, accurate reports','Doctor-verified, delivered on time'],
];

function LabsContent() {
  const params = useSearchParams();
  const initialTest = tests.find(test => test.name === params.get('test'))?.name || '';
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState(initialTest);
  const [modal,setModal] = useState(initialTest ? 'tests' : '');
  const [city,setCity] = useState('Gurgaon');
  const [date,setDate] = useState('');
  const [time,setTime] = useState('');
  const [notice,setNotice] = useState('');
  const [slide,setSlide] = useState(0);
  const [paused,setPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const shown = tests.filter(test => test.name.toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => {
    if (modal) dialog.current?.showModal(); else dialog.current?.close();
  }, [modal]);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setSlide(value => (value + 1) % stories.length), 5500);
    return () => clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    const item = rail.current?.children[slide] as HTMLElement | undefined;
    rail.current?.scrollTo({left:item ? item.offsetLeft - rail.current.offsetLeft : 0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }, [slide]);
  function browse(value = '') {
    if (value === 'radiology') { document.getElementById('radiology')?.scrollIntoView({behavior:'smooth'}); return; }
    setQuery(value); setSelected(''); setNotice(''); setModal('tests');
  }
  function close() { setModal(''); setNotice(''); }
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Book lab tests online from trusted and certified labs</h1>
        <form className={styles.search} onSubmit={event => {event.preventDefault();browse(query)}}>
          <button type="button" className={styles.location} onClick={() => setModal('location')} aria-label={`Change location, currently ${city}`}><MapPin size={20}/><span>{city}</span><LocateFixed size={17}/></button>
          <input placeholder="Search tests or full body checkups" aria-label="Search lab tests" value={query} onChange={event => setQuery(event.target.value)}/>
          <button className={styles.searchButton} aria-label="Search tests"><Search size={23}/></button>
        </form>
        <div className={styles.actions}>
          {[['Book via Phone Call','3ca09662-bac2-4ccd-8160-73b191134a07.png','phone'],['Quick Order','73ee3673-7f5a-481d-9e5d-ede27573b8cb.png','tests'],['Book via Whatsapp','8c0dda7f-92be-46a4-ad88-ddd3302e8707.png','whatsapp']].map(([label,img,action]) => <button key={label} onClick={() => action === 'tests' ? browse() : setModal(action)}><img src={image(img)} alt=""/>{label}</button>)}
        </div>
        <div className={styles.needs}><h2>Find tests &amp; packages for your needs</h2><div>{categories.map(([label,img,filter]) => <button key={label} onClick={() => browse(filter)}><span>{label}</span><img src={image(img)} alt=""/></button>)}</div></div>
      </div>
      <div className={styles.mosaic}>{[photos.slice(0,2),photos.slice(2)].map((column,index) => <div className={styles.photoColumn} key={index}>{column.map(([img,title,caption]) => <div className={styles.photo} key={img}><img src={image(img)} alt=""/><div><strong>{title}</strong><span>{caption}</span></div></div>)}</div>)}</div>
    </section>
    <section className={styles.section}><h2>Tests and packages for your health needs</h2><div className={styles.categoryRow}>{needs.map(([label,img,filter]) => <button key={label} onClick={() => browse(filter)}><img src={image(img)} alt=""/><span>{label}</span></button>)}</div></section>
    <section className={styles.stories} aria-label="Discover Tata 1mg Labs">
      <div className={styles.arrows}><button aria-label="Previous lab story" onClick={() => setSlide((slide + 3) % 4)}><ChevronLeft size={18}/></button><button aria-label="Next lab story" onClick={() => setSlide((slide + 1) % 4)}><ChevronRight size={18}/></button></div>
      <div className={styles.storyRail} ref={rail}>{stories.map(([label,img,href]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label}: view the official Tata 1mg resource`}><img src={image(img)} alt={label}/></a>)}</div>
      <div className={styles.progress}>{stories.map(([label],index) => <button aria-label={`Show ${label}`} aria-current={slide === index ? 'true' : undefined} className={slide === index ? styles.active : ''} key={label} onClick={() => setSlide(index)}/>)}<button className={styles.pause} aria-label={paused ? 'Play carousel' : 'Pause carousel'} onClick={() => setPaused(!paused)}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button></div>
    </section>
    <section className={styles.section} id="radiology"><h2>Radiology tests, x-rays &amp; scans</h2><div className={styles.categoryRow}>{scans.map(([label,img]) => <button key={label} onClick={() => browse(label)}><img src={image(img)} alt=""/><span>{label}</span></button>)}</div></section>
    <section className={styles.section}><h2>How does home sample collection work?</h2><div className={styles.steps}>{steps.map(([title,img,description]) => <article key={title}><img src={image(img)} alt=""/><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className={styles.appBanner}><div><h2>Download the Tata 1mg app. Trusted healthcare, at your fingertips.</h2><p>Book tests, track reports, and get AI-powered health insights.</p><div className={styles.download}><div><a href="https://apps.apple.com/in/app/1mg/id554578419" target="_blank" rel="noreferrer"><img src={image('4e57f502-fa09-4972-b7b9-6f40c5725395.png')} alt="Download on the App Store"/></a><a href="https://play.google.com/store/apps/details?id=com.aranoah.healthkart.plus" target="_blank" rel="noreferrer"><img src={image('95ecc4b8-f2a3-4595-ad0c-6a6d467129a0.png')} alt="Get it on Google Play"/></a></div><span>or</span><img className={styles.qr} src={image('f0433fc2-4257-4859-a97a-16292498e80a.jpeg')} alt="Scan to download the official Tata 1mg app"/></div></div></section>
    <details className={styles.information}><summary>Keep your health in check with Tata 1mg: Lab tests just a click away</summary><h3>Tata 1mg brings care to health</h3><p>Explore lab tests and health packages, with home sample collection and online reports.</p><h3>Lab tests now at your doorstep</h3><p>Search for a test, choose a package and select a convenient collection slot.</p><h3>Need more help?</h3><p>Use Quick Order to explore the available tests, or visit <a href="/profile/reports">your reports</a>.</p><h3>The services we offer</h3><p>This demonstration includes the listed blood tests and sample scheduling. Radiology, live tracking and lab report delivery require a connected lab provider.</p></details>
    <dialog className={styles.dialog} ref={dialog} onCancel={close} onClick={event => {if(event.target === event.currentTarget) close()}} aria-labelledby="labs-dialog-title"><button className={styles.close} aria-label="Close" onClick={close}><X size={22}/></button>
      <h2 id="labs-dialog-title">{modal === 'location' ? 'Your location' : modal === 'phone' ? 'Book via Phone Call' : modal === 'whatsapp' ? 'Book via Whatsapp' : selected ? 'Choose a collection slot' : 'Find a test or package'}</h2>
      {modal === 'location' ? <form onSubmit={event => {event.preventDefault();close()}}><label>City<input value={city} onChange={event => setCity(event.target.value)} required maxLength={40}/></label><p>Service availability depends on the connected lab provider.</p><button className={styles.primary}>Save location</button></form> : modal === 'phone' || modal === 'whatsapp' ? <><p>{modal === 'phone' ? 'Phone' : 'WhatsApp'} booking is not configured for this store yet. You can explore the available tests with Quick Order.</p><button className={styles.primary} onClick={() => browse()}>Quick Order</button></> : selected ? <form onSubmit={event => {event.preventDefault();setNotice(`Selected ${selected} on ${date}, ${time}. No appointment has been sent to a lab.`)}}><p><strong>{selected}</strong></p><p>Demo scheduling: your selection stays in this session.</p><label>Collection date<input type="date" required min={new Date().toLocaleDateString('en-CA')} value={date} onChange={event => setDate(event.target.value)}/></label><label>Time slot<select required value={time} onChange={event => setTime(event.target.value)}><option value="">Select a slot</option>{['07:00 - 08:00','08:00 - 09:00','09:00 - 10:00','10:00 - 11:00'].map(slot => <option key={slot}>{slot}</option>)}</select></label><button className={styles.primary}>Confirm selection</button><button type="button" className={styles.back} onClick={() => {setSelected('');setNotice('')}}>Back to tests</button>{notice && <p role="status">{notice}</p>}</form> : <><input autoFocus aria-label="Filter available tests" placeholder="Search tests or packages" value={query} onChange={event => setQuery(event.target.value)}/><div className={styles.results}>{shown.map(test => <button key={test.name} onClick={() => {setSelected(test.name);setNotice('')}}><span>{test.name}<small>Home sample collection</small></span><strong>&#8377;{test.price}</strong><ChevronRight size={18}/></button>)}</div>{!shown.length && <p role="status">No tests in this category are currently available. <button className={styles.back} onClick={() => setQuery('')}>See available tests</button></p>}</>}
    </dialog>
  </main>;
}
export default function LabsPage() { return <Suspense fallback={<main className="container section">Loading tests...</main>}><LabsContent/></Suspense>; }
