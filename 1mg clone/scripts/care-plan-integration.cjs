// Isolated API and temporary records. Razorpay responses are mocked; no money is moved.
const path=require('path');
require('../backend/node_modules/dotenv').config({path:path.join(__dirname,'../backend/.env'),quiet:true});
const {postgres,connectDatabases}=require('../backend/config/database');
const express=require('../backend/node_modules/express');
const cookieParser=require('../backend/node_modules/cookie-parser');
const crypto=require('crypto');
const assert=require('assert/strict');
const {execFile}=require('child_process');
const run=require('util').promisify(execFile);
const {priceCart}=require('../backend/utils/cartPricing');
const controller=require('../backend/controllers/orderController');
let server,userId;
async function create(body){return new Promise((resolve,reject)=>{const res={statusCode:200,status(code){this.statusCode=code;return this},json(data){resolve({status:this.statusCode,...data})}};controller.create({user:{id:userId},body},res,reject).catch(reject)})}
async function main(){
 await connectDatabases();
 const app=express();app.use(express.json());app.use(cookieParser());
 for(const name of ['auth','cart','products','orders','account'])app.use('/api/'+name,require('../backend/routes/'+(name==='products'?'product':name==='orders'?'order':name)+'Routes'));
 app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
 app.use((e,_req,res,_next)=>res.status(e.status||500).json({message:e.message}));
 server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const result=await run(process.execPath,['scripts/api-smoke.cjs'],{env:{...process.env,API_SMOKE_BASE:`http://127.0.0.1:${server.address().port}/api`}});console.log(result.stdout);
 userId=(await postgres.query('INSERT INTO users(name,email,password_hash,is_email_verified) VALUES($1,$2,$3,true) RETURNING id',['Membership QA',`membership-qa-${crypto.randomUUID()}@example.invalid`,'not-a-login-password'])).rows[0].id;
 process.env.RAZORPAY_KEY_ID='test_key';process.env.RAZORPAY_KEY_SECRET='test_secret';
 const oldFetch=global.fetch;
 try {
  const items=[{id:'care-plan-3-months',quantity:1}];
  const quote=await priceCart(postgres,items);
  const payment={razorpay_order_id:'order_TestIntegration',razorpay_payment_id:'pay_'+crypto.randomBytes(12).toString('hex')};
  payment.razorpay_signature=crypto.createHmac('sha256','test_secret').update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`).digest('hex');
  global.fetch=async url=>{assert(url.startsWith('https://api.razorpay.com/'));return {ok:true,json:async()=>url.includes('/orders/')?{notes:{user_id:userId,cart_fingerprint:quote.fingerprint},amount:16500,currency:'INR',status:'paid'}:{order_id:payment.razorpay_order_id,amount:16500,currency:'INR',status:'captured',amount_refunded:0}}};
  const body={items,totalAmount:165,paymentMethod:'UPI',payment,deliveryAddress:{name:'QA',phone:'9999999999',line1:'QA only',city:'Delhi',state:'Delhi',pincode:'110001'}};
  const placed=await create(body);assert.equal(placed.status,201);
  const replay=await create(body);assert.equal(replay.order.id,placed.order.id);
  const membership=await postgres.query('SELECT *, expires_at = starts_at + INTERVAL \'3 months\' AS correct_duration FROM care_memberships WHERE user_id=$1',[userId]);
  assert.equal(membership.rowCount,1);assert.equal(membership.rows[0].duration_months,3);assert.equal(membership.rows[0].correct_duration,true);
  assert.equal((await postgres.query('SELECT * FROM carts WHERE user_id=$1',[userId])).rowCount,0);
  console.log('Mock-paid order saved; membership duration verified; repeated confirmation did not create a duplicate.');
 } finally {global.fetch=oldFetch}
}
main().catch(e=>{console.error(e.stderr||e.stack);process.exitCode=1}).finally(async()=>{if(userId){await postgres.query('DELETE FROM care_memberships WHERE user_id=$1',[userId]);await postgres.query('DELETE FROM orders WHERE user_id=$1',[userId]);await postgres.query('DELETE FROM users WHERE id=$1',[userId]);console.log('Temporary membership, order and user removed.')}if(server)await new Promise(r=>server.close(r));await postgres.end()});
