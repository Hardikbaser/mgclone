import fs from 'node:fs';
import assert from 'node:assert/strict';
const target=await(await fetch('http://localhost:9223/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0,signedIn=false;const pending=new Map();const errors=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>reject(Error('Timeout '+method)),15000);pending.set(n,m=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result)});ws.send(JSON.stringify({id:n,method,params}))});
ws.onmessage=async e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else if(m.method==='Fetch.requestPaused'){const url=m.params.request.url;let code=200,body={};if(url.includes('/auth/me')){code=signedIn?200:401;body=signedIn?{user:{name:'A very long account name that must never change navigation spacing',email:'sample@example.invalid'}}:{message:'Authentication required'}}else if(url.includes('/auth/logout')){signedIn=false;code=204}else if(url.includes('/cart'))body={items:[]};else body={products:[],total:0,pages:0};await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'http://localhost:3000'},{name:'Access-Control-Allow-Credentials',value:'true'}],body:code===204?'':Buffer.from(JSON.stringify(body)).toString('base64')})}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)};
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};
const waitFor=async expression=>{for(let n=0;n<50;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,150))}throw Error('Failed '+expression)};
const geometry=()=>evaluate("JSON.stringify([...document.querySelectorAll('nav[aria-label=\"Main navigation\"] a')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}))");
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('qa/'+name+'.png',Buffer.from(r.data,'base64'))};

try {
 await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'http://localhost:5000/api/*'}]});signedIn=true;
 for(const width of [1366,1280,390]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width<600});
 for(const path of ['/','/doctors','/labs']){
 await send('Page.navigate',{url:'http://localhost:3000'+path});await waitFor("!!document.querySelector('[aria-label=\"Account menu\"]')");await new Promise(r=>setTimeout(r,1200));
 const metrics=await evaluate(`(()=>{const nav=document.querySelector('nav[aria-label="Main navigation"]');const links=[...nav.children].map(e=>{const range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,height:r.height}});return {links,overflow:document.documentElement.scrollWidth>innerWidth,headerHeight:document.querySelector('header>div').getBoundingClientRect().height}})()`);
 assert(!metrics.overflow,'Overflow '+path+' '+width);if(width>1199)for(let i=1;i<metrics.links.length;i++)assert(metrics.links[i].x-metrics.links[i-1].right>=10,'Crowded labels '+path+' '+width);
 console.log(width,path,JSON.stringify(metrics));await shot('nav-signed-'+width+'-'+(path.slice(1)||'home'));
 }
 }
}finally{ws.close();await fetch('http://localhost:9223/json/close/'+target.id)}
