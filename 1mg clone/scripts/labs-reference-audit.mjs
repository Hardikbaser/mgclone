import fs from 'node:fs';
const [url='http://localhost:3000', name='local', width='1440', height='1000'] = process.argv.slice(2);
const target=await (await fetch('http://localhost:9223/json/new?'+encodeURIComponent(url),{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();const errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:+width,height:+height,deviceScaleFactor:1,mobile:+width<600});
await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,6000));
if(process.env.QA_ACTION) { const action=await send('Runtime.evaluate',{expression:process.env.QA_ACTION,awaitPromise:true}); if(action.exceptionDetails)errors.push(action.exceptionDetails.exception?.description||action.exceptionDetails.text); await new Promise(r=>setTimeout(r,1500)); }
const data=await send('Runtime.evaluate',{expression:`JSON.stringify({url:location.href,title:document.title,text:document.body.innerText.slice(0,14000),images:[...document.images].map(i=>({src:i.currentSrc||i.src,alt:i.alt,w:i.naturalWidth,h:i.naturalHeight})),details:[...document.querySelectorAll('h1,h2,main a,video,iframe,[style]')].map(e=>({tag:e.tagName,text:e.textContent?.slice(0,80),href:e.href,src:e.src,bg:getComputedStyle(e).backgroundImage,font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize})).filter(e=>e.bg!=='none'||e.href||e.src||e.tag==='H1'||e.tag==='H2'),fonts:[...document.fonts].map(f=>f.family),resources:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/woff|ttf|png|jpg|jpeg|webp|svg/.test(n)),overflow:document.documentElement.scrollWidth>innerWidth})`,returnByValue:true});
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/'+name+'.json',data.result.value||JSON.stringify(data));
const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('qa/'+name+'.png',Buffer.from(shot.data,'base64'));
console.log(JSON.stringify({name,errors,summary:JSON.parse(data.result.value||'{}').text?.slice(0,200)}));ws.close();await fetch('http://localhost:9223/json/close/'+target.id);
