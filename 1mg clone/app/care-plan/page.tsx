'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '../../lib/useCartStore';
import { apiFetch } from '../../lib/api';
import plans from '../../lib/care-plans.json';
import { Suspense, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { asset } from '../../lib/assets';
import styles from './care.module.css';
const memberReviews = [
 {name:'Sanjay Mehta',quote:'Ghar ki regular medicines manage karna ab kaafi aasaan lagta hai. Ek hi jagah medicines, lab tests aur doctor consultation ke options mil jaate hain. Mere parents ke liye har mahine ki healthcare planning mein yeh kaafi convenient hai. Plan ki details ek saath dekh kar apni zaroorat ke hisaab se choose karna bhi simple tha.'},
 {name:'Priya Sharma',quote:'I like having the different healthcare options together in one place. The plan comparison is easy to understand, and I can choose a duration that suits my family. Being able to review my medicines and plan in the same cart makes the experience feel simple and organised.'},
 {name:'Amit Verma',quote:'Parents ki medicines aur apne health checkups ko organise karne ke liye mujhe ek simple experience chahiye tha. Care Plan ke benefits aur duration clearly dikhte hain. Family ke healthcare needs ko ek jagah se plan kar pana mere liye sabse helpful part hai.'},
];
const benefits = [
 ['viz4ybkh6wfq9sjbu4ze.png','Get extra 4% discounts','Save an additional 4% on eligible health products, over and above promotional offers.'],
 ['viz4ybkh6wfq9sjbu4ze.png','Discounted lab test','Explore discounts on selected lab tests in serviceable cities.'],
 ['xrrbnozjyplezqml6crx.png','No Shipping Charges','Free shipping on qualifying orders, subject to membership limits and minimum cart value.'],
 ['ll8w1jwk0yjkbcx1dpcw.png','Free E-Consultation','A consultation benefit to help you connect with a doctor from the comfort of home.'],
 ['/assets/ui/care-offers.jpg','Exclusive offers','Discover member-only offers across health and wellness services.'],
 ['jee7thstqouh0m4xflgp.png','Introducing Rapid Delivery','Faster delivery on available medicines in selected cities, depending on service availability.'],
];
const additional = [
 ['tjnmrux8irkbvtj5qu7g.png','Early Sale Access','Be among the first to explore sale events and member offers across categories.'],
 ['rciejxt8uupxvkdoztx1.png','Priority Processing','Priority order processing and prescription validation are part of the reference membership benefits.'],
 ['q2xl4gwlyw55awctv1lk.png','Premium Customer Care','Dedicated support for membership queries, with an emphasis on responsive assistance.'],
];
const faqs = [
 ['How do I avail discount?','Add your selected plan to the cart and complete online checkout. The purchased duration and membership dates appear in Your orders. Selecting a plan alone does not activate benefits.'],
 ['Terms & conditions around Free Shipping','Benefits depend on minimum order value, usage limits and delivery location. Your actual checkout continues to show this application’s existing charges.'],
 ['Is the membership fee a one-time payment?','Yes. Pay once for the selected duration through checkout. There is no automatic recurring charge.'],
 ['Can I cancel my subscription plan?','Your purchased plan is listed in Your orders. Cancellation and refund requests are not currently supported through this page.'],
 ['Is the membership fee final?','The cart shows the price of the selected plan. Care Plans do not incur shipping charges or medicine-cart discounts.'],
 ['How will the lab test be conducted?','Visit Labs to explore the available tests. Its scheduling flow remains a demo and does not send a booking to a laboratory.'],
 ['What do you mean by free premium consults?','The reference includes a consultation benefit. Consult Doctors lets you explore the doctors and consultation flow available in this project.'],
 ['Is my order eligible for rapid delivery?','Rapid delivery is not currently enabled. Check the delivery information shown at checkout for your actual order.'],
];
function Benefit({item}:{item:string[]}){return <article className={styles.benefit}><img src={item[0].startsWith('/')?item[0]:asset(item[0])} alt="" width={60} height={60}/><div><h3>{item[1]}</h3><p>{item[2]}</p></div></article>}
function CarePlanContent(){
 const params=useSearchParams(),router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [reviewIndex,setReviewIndex]=useState(0);
 const review=memberReviews[reviewIndex];
 const [selected,setSelected]=useState(params.get('plan')===plans[1].id?1:0),[medicines,setMedicines]=useState(true),[consultation,setConsultation]=useState(true);
 const plan=plans[selected];
 async function join(){
  setBusy(true);setError('');
  try {
   const me=await apiFetch('/auth/me');
   if(me.status===401){router.push('/login?next='+encodeURIComponent('/care-plan?plan='+plan.id));return;}
   if(!me.ok)throw Error('Unable to check your account. Please try again.');
   await useCartStore.getState().loadCart();
   await useCartStore.getState().addItem({...plan,quantity:1,durationMonths:plan.months});
  }catch(e){setError(e instanceof Error?e.message:'Unable to add Care Plan.')}finally{setBusy(false)}
 }
 const savings=(medicines?1000*0.04*plan.months:0)+(consultation?500:0);
 function option(index:number,compact=false){const p=plans[index];return <label key={p.months} className={compact?styles.compactOption:`${styles.planCard} ${selected===index?styles.selected:''}`}><input type="radio" name={compact?'sticky-plan':'membership-plan'} checked={selected===index} onChange={()=>setSelected(index)} aria-label={`${p.months} months plan, ${p.price} rupees`}/>{compact?<span><strong>₹ {p.price}</strong><span> for {p.months} months plan</span> <em className={index===0?styles.newBadge:styles.savingBadge}>{p.badge}</em></span>:<div><h3>{p.months} months plan {index===0&&<em className={styles.newBadge}>NEW</em>}</h3><strong className={styles.price}>₹ {p.price}</strong><p>₹{p.monthly}/month {index===1&&<em className={styles.savingBadge}>Save 16%</em>}</p></div>}</label>}
 return <main className={styles.page}>
  <section className={styles.hero}><div className={styles.heroInner}><div className={styles.heroCopy}><img className={styles.logo} src={asset('ekjkxafxcqqg0oinr3fu.png')} alt="Care Plan" width={133} height={33}/><h1>Reduce your medical<br/>expenses by HALF</h1><p>Save for things that make you happy</p><a href="#plans" className={styles.button}>Explore plans</a><p className={styles.starting}>Plans starting Rs 46/month</p></div><img className={styles.family} src={asset('gek7gtlcjca85q0l3ees.jpg')} alt="A couple at home using a tablet together" width={400} height={267}/></div></section>
  <section className={styles.benefitsSection}><h2>Benefits</h2><div className={styles.benefits}>{benefits.map(item=><Benefit key={item[1]} item={item}/>)}</div></section>
  <section className={styles.additional}><h2>Additional Benefits</h2><div>{additional.map(item=><Benefit key={item[1]} item={item}/>)}</div></section>
  <section className={styles.membership} id="plans"><div className={styles.membershipInner}><article className={styles.includes}><img className={styles.logo} src={asset('ekjkxafxcqqg0oinr3fu.png')} alt="Care Plan" width={133} height={33}/><h2>More discounts, faster delivery and extra care</h2><p>Join now and enjoy all the benefits</p><h3>Membership includes</h3><ul>{['Free Shipping','1 Free E-consultation','All other benefits mentioned above'].map(text=><li key={text}><Check size={20}/>{text}</li>)}</ul></article><div className={styles.planChoices}><h2>Choose a plan that&apos;s right for you</h2><fieldset><legend className={styles.srOnly}>Membership duration</legend>{plans.map((_,i)=>option(i))}</fieldset><button className={styles.button} disabled={busy} onClick={join}>{busy?'Adding...':'Join now'}</button><p className={styles.previewNote}>One-time payment. Your plan starts after payment is verified.</p></div></div></section>
  <section className={styles.calculator}><h2>How much could I save with this plan?</h2><div className={styles.calculatorInner}><div className={styles.savings} aria-live="polite"><strong>₹{savings}</strong><span>Illustrative savings in {plan.months} months</span></div><div className={styles.assumptions}><label><input type="checkbox" checked={medicines} onChange={e=>setMedicines(e.target.checked)}/><span>I buy medicines every month<small>Assuming ₹1,000 per month and an additional 4% discount.</small></span></label><label><input type="checkbox" checked={consultation} onChange={e=>setConsultation(e.target.checked)}/><span>I visit the Doctor regularly<small>Assuming one included consultation worth ₹500.</small></span></label><p>This estimate excludes the plan fee and delivery savings. Availability of individual benefits depends on the connected service.</p></div></div></section>
  <section className={styles.memberStories} aria-labelledby="member-reviews-heading" aria-roledescription="carousel"><h2 id="member-reviews-heading">See what our members are saying</h2><div className={styles.reviewCarousel}><button className={styles.reviewArrow} aria-label="Previous member review" onClick={()=>setReviewIndex(i=>(i+memberReviews.length-1)%memberReviews.length)}><ChevronLeft size={26}/></button><figure className={styles.review} aria-live="polite" aria-atomic="true"><blockquote>&ldquo;{review.quote}&rdquo;</blockquote><figcaption><span className={styles.reviewAvatar} aria-hidden="true">{review.name[0]}</span><strong>{review.name}</strong></figcaption></figure><button className={styles.reviewArrow} aria-label="Next member review" onClick={()=>setReviewIndex(i=>(i+1)%memberReviews.length)}><ChevronRight size={26}/></button></div><div className={styles.reviewDots}>{memberReviews.map((item,i)=><button key={item.name} aria-label={`Show sample review ${i+1}`} aria-pressed={reviewIndex===i} className={reviewIndex===i?styles.reviewDotActive:''} onClick={()=>setReviewIndex(i)}/>)}</div><small className={styles.reviewNote}>Sample reviews for demonstration</small></section>
  <section className={styles.faq}><h2>Frequently Asked Questions</h2>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
  <aside className={styles.stickyBar} aria-label="Choose your Care Plan"><div><fieldset><legend className={styles.srOnly}>Quick membership selection</legend>{plans.map((_,i)=>option(i,true))}</fieldset><button className={styles.button} disabled={busy} onClick={join}>{busy?'Adding...':'Join now'}</button></div></aside>
  {error&&<div className={styles.cartError} role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss error">?</button></div>}
 </main>
}

export default function CarePlanPage(){return <Suspense fallback={<main>Loading Care Plans?</main>}><CarePlanContent/></Suspense>}
