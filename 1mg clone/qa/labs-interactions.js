(async () => {
 const wait=()=>new Promise(r=>setTimeout(r,200));
 const assert=(ok,message)=>{if(!ok)throw Error(message)};
 const click=text=>{const el=[...document.querySelectorAll('main button')].find(e=>e.textContent.trim()===text);assert(el,'Missing '+text);el.click()};
 click('Quick Order');await wait();assert(document.querySelector('dialog').open,'Quick Order did not open');
 const test=[...document.querySelectorAll('dialog button')].find(e=>e.textContent.includes('Thyroid Profile'));test.click();await wait();
 assert(document.querySelector('dialog').textContent.includes('Choose a collection slot'),'Slot selector missing');
 const set=(el,value)=>{Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
 set(document.querySelector('dialog input[type=date]'),'2027-01-01');set(document.querySelector('dialog select'),'08:00 - 09:00');await wait();click('Confirm selection');await wait();assert(document.querySelector('[role=status]').textContent.includes('No appointment has been sent'),'Demo confirmation missing');
 document.querySelector('button[aria-label=Close]').click();await wait();assert(!document.querySelector('dialog').open,'Close failed');
 click('Allergy');await wait();assert(document.querySelector('dialog').textContent.includes('No tests in this category'),'Unavailable category not handled');click('See available tests');await wait();assert(document.querySelector('dialog').textContent.includes('Thyroid Profile'),'Reset filter failed');
 document.querySelector('button[aria-label=Close]').click();await wait();
 document.querySelector('button[aria-label="Pause carousel"]').click();await wait();assert(document.querySelector('button[aria-label="Play carousel"]'),'Pause failed');
 document.querySelector('button[aria-label="Next lab story"]').click();await wait();assert(document.querySelector('button[aria-current=true]'),'Carousel state missing');
 assert(![...document.querySelectorAll('main img')].some(i=>!i.complete||!i.naturalWidth),'Broken image');assert(document.documentElement.scrollWidth<=innerWidth,'Page overflow');
 document.title='Labs interaction checks passed';
})()
