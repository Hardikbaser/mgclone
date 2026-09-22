// Real browser + isolated current API. Temporary account; no checkout submission.
const path=require('path'),fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
require('../backend/node_modules/dotenv').config({path:path.join(__dirname,'../backend/.env'),quiet:true});
const {postgres}=require('../backend/config/database');
const express=require('../backend/node_modules/express'),jwt=require('../backend/node_modules/jsonwebtoken');
let server,userId,ws,target,send;
async function main(){
 userId=(await postgres.query('INSERT INTO users(name,email,password_hash,is_email_verified) VALUES($1,$2,$3,true) RETURNING id',['Browser QA',`browser-qa-${crypto.randomUUID()}@example.invalid`,'not-a-login-password'])).rows[0].id;
 const app=express();app.use(require('../backend/node_modules/cors')({origin:true,credentials:true}));app.use(express.json());app.use(require('../backend/node_modules/cookie-parser')());
 for(const name of ['auth','cart','account'])app.use('/api/'+name,require('../backend/routes/'+name+'Routes'));
 app.use((e,_req,res,_next)=>res.status(e.status||500).json({message:e.message}));
 server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 target=await(await fetch('http://localhost:9223/json/new?about:blank',{method:'PUT'})).json();ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map();send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method))},20000);pending.set(n,m=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result)});ws.send(JSON.stringify({id:n,method,params}))});
 ws.onmessage=async e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else if(m.method==='Fetch.requestPaused'){const req=m.params.request;const headers={...req.headers};delete headers.Host;headers.Cookie='token='+jwt.sign({userId,role:'PATIENT'},process.env.JWT_SECRET,{expiresIn:'10m'});const response=await fetch(req.url.replace('http://localhost:5000',base),{method:req.method,headers,body:req.postData});await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:response.status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'http://localhost:3000'},{name:'Access-Control-Allow-Credentials',value:'true'},{name:'Access-Control-Allow-Headers',value:'content-type'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,OPTIONS'}],body:Buffer.from(await response.text()).toString('base64')})}};
 await send('Page.enable');await send('Network.enable');await send('Fetch.enable',{patterns:[{urlPattern:'http://localhost:5000/api/*'}]});
 await send('Network.setCookie',{name:'token',value:jwt.sign({userId,role:'PATIENT'},process.env.JWT_SECRET,{expiresIn:'10m'}),url:'http://localhost:3000',httpOnly:true,sameSite:'Lax'});
 await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||'Browser exception');return r.result.value};
 const waitFor=async expression=>{for(let i=0;i<40;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,250))}throw Error('Browser condition failed: '+expression)};
 await send('Page.navigate',{url:'http://localhost:3000/care-plan?plan=care-plan-6-months'});
 await waitFor("document.body.innerText.includes('Browser QA')");
 await evaluate("document.querySelector('aside[aria-label=\"Choose your Care Plan\"] button').click()");
 await waitFor("!!document.querySelector('#cart-title')");
 assert(await evaluate("document.querySelector('#cart-title').closest('aside').innerText.includes('Care Plan - 6 months')"));
 assert(!(await evaluate("!!document.querySelector('[aria-label=\"Increase Care Plan - 6 months\"]')")));
 const screenshot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('qa/'+name+'.png',Buffer.from(s.data,'base64'))};
 await screenshot('care-plan-cart-connected');
 await evaluate("document.querySelector('#cart-title').closest('aside').querySelector('a[href=\"/checkout\"]').click()");
 await waitFor("document.body.innerText.includes('Your billing details')");
 assert(await evaluate("document.body.innerText.includes('Care Plan - 6 months')"));
 assert(await evaluate("[...document.querySelectorAll('label')].find(l=>l.innerText.includes('Cash on delivery')).querySelector('input').disabled"));
 assert(await evaluate("[...document.querySelectorAll('aside div')].some(d=>d.children.length===2&&d.firstElementChild.textContent==='Delivery fee'&&d.lastElementChild.textContent.endsWith('0'))"));
 assert(await evaluate("[...document.querySelectorAll('aside div')].some(d=>d.children.length===2&&d.firstElementChild.textContent==='To pay'&&d.lastElementChild.textContent.endsWith('275'))"));
 await screenshot('care-plan-checkout-connected');
 console.log('Browser passed: Join now, persisted 6-month cart item, no quantity increase, checkout billing view, zero delivery, total 275, COD disabled.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1}).finally(async()=>{if(send&&ws?.readyState===1){await send('Network.deleteCookies',{name:'token',domain:'localhost'});ws.close()}if(target)await fetch('http://localhost:9223/json/close/'+target.id);if(server)await new Promise(r=>server.close(r));if(userId){await postgres.query('DELETE FROM users WHERE id=$1',[userId]);console.log('Temporary browser account and cart removed.')}await postgres.end()});
