(async()=>{
 const wait=()=>new Promise(r=>setTimeout(r,150));const assert=(v,m)=>{if(!v)throw Error(m)};
 const click=t=>{const e=[...document.querySelectorAll('main button')].find(e=>e.textContent.trim()===t);assert(e,'Missing '+t);e.click()};
 click('Consult now');await wait();assert(document.querySelector('dialog').open,'Consult dialog failed');assert(document.querySelectorAll('dialog article').length===3,'Doctors missing');
 click('Book slot');await wait();assert(document.querySelector('dialog input[type=date]'),'Date input missing');
 const set=(el,value)=>{Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
 set(document.querySelector('dialog input[type=date]'),'2027-01-01');set(document.querySelector('dialog select'),'10:00 AM');await wait();click('Confirm selection');await wait();assert(document.querySelector('[role=status]').textContent.includes('no appointment has been sent'),'Demo confirmation missing');
 document.querySelector('button[aria-label=Close]').click();await wait();
 const before=document.querySelector('[aria-live=polite]').textContent;document.querySelector('button[aria-label="Next review"]').click();await wait();assert(document.querySelector('[aria-live=polite]').textContent!==before,'Review controls failed');
 document.querySelector('main summary').click();assert(document.querySelector('main details').open,'FAQ failed');
 assert(![...document.querySelectorAll('main img')].some(i=>!i.naturalWidth),'Broken images');assert(document.documentElement.scrollWidth<=innerWidth,'Page overflows');
 const links=[...document.querySelectorAll('nav[aria-label="Main navigation"]>a')].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y+r.height/2,w:r.width}});if(innerWidth>1100)assert(links.every(r=>Math.abs(r.y-33)<1),'Uneven navigation alignment');
 document.title='Doctor page interaction and navigation checks passed';
})()
