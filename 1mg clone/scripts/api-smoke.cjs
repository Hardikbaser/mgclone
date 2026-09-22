// Local integration check: temporary verified account, no mail, orders or payments.
const path = require('path');
require('../backend/node_modules/dotenv').config({path:path.join(__dirname,'../backend/.env'),quiet:true});
const {postgres}=require('../backend/config/database');
const bcrypt=require('../backend/node_modules/bcryptjs');
const crypto=require('crypto');
const assert=require('assert/strict');
async function main(){
 let userId;let cookie='';const results=[];
 async function request(route,method='GET',body,status=200){
  const r=await fetch((process.env.API_SMOKE_BASE || 'http://localhost:5000/api')+route,{method,headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});
  assert.equal(r.status,status,`${method} ${route}: ${r.status===status?'':await r.clone().text()}`);
  if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];
  results.push(`${method} ${route}: ${status}`);return status===204?null:r.json();
 }
 try{
  await request('/health');await request('/cart','GET',null,401);
  const p=(await request('/products?search=Dolo')).products[0];assert(p);
  await request('/products/'+p.id);await request('/products/dolo-650mg-tablet');
  await request('/products/missing-qa-product','GET',null,404);
  const sorted=(await request('/products?sort=price_asc&limit=48')).products;
  assert(sorted.every((p,i)=>i===0||p.price>=sorted[i-1].price));
  const email=`ui-qa-${crypto.randomUUID()}@example.invalid`,password=crypto.randomBytes(24).toString('hex');
  userId=(await postgres.query('INSERT INTO users(name,email,password_hash,is_email_verified) VALUES($1,$2,$3,true) RETURNING id',['UI QA',email,await bcrypt.hash(password,12)])).rows[0].id;
  await request('/auth/login','POST',{email,password});await request('/auth/me');
  for(const quantity of [1,3]){const cart=await request('/cart','PUT',{items:[{id:p.id,quantity}]});assert.equal(cart.items[0].quantity,quantity);assert.equal(cart.items[0].price,p.price)}
  assert.equal((await request('/cart')).items[0].quantity,3);
  assert.equal((await request('/cart','PUT',{items:[]})).items.length,0);
  const address={name:'UI QA',phone:'9999999999',line1:'QA test address',city:'Delhi',state:'Delhi',pincode:'110001'};
  await request('/account/address','PUT',{address});assert.deepEqual((await request('/account/address')).address,address);
  const care=(await request('/cart','PUT',{items:[{id:'care-plan-3-months',price:1,quantity:1}]})).items[0];
  assert.equal(care.price,165);assert.equal(care.kind,'care-plan');assert.equal(care.durationMonths,3);
  await request('/cart','PUT',{items:[{id:'care-plan-3-months',quantity:2}]},400);
  await request('/orders','POST',{items:[care],totalAmount:165,paymentMethod:'CASH_ON_DELIVERY',deliveryAddress:address},400);
  assert.equal((await request('/cart','PUT',{items:[{id:'care-plan-6-months',quantity:1},{id:p.id,quantity:1}]})).items.length,2);
  await request('/orders');await request('/auth/logout','POST',null,204);await request('/auth/me','GET',null,401);
  console.log(results.join('\n'));
 }finally{if(userId){await postgres.query('DELETE FROM users WHERE id=$1',[userId]);console.log('Temporary account, cart and address removed.')}await postgres.end()}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
