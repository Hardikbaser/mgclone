const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { priceCart } = require('../utils/cartPricing');
const { verifyOrderPayment } = require('../utils/verifyOrderPayment');
const planId = 'care-plan-3-months';
const productId = '00000000-0000-0000-0000-000000000001';
const db = {query: async () => ({rows:[{id:productId,name:'Test medicine',price:300,stock:10}]})};
test('Care Plan pricing ignores client price and has no shipping', async()=>{
 const q=await priceCart(db,[{id:planId,price:1,quantity:1}]);
 assert.equal(q.total,165);assert.equal(q.deliveryFee,0);assert.equal(q.items[0].durationMonths,3);
});
test('Mixed cart discounts only the physical subtotal',async()=>{
 const q=await priceCart(db,[{id:productId,quantity:1},{id:'care-plan-6-months'}]);
 assert.equal(q.total,624);assert.equal(q.discount,0);
 const discounted=await priceCart(db,[{id:productId,quantity:2},{id:planId}]);assert.equal(discounted.total,764);
});
test('Duplicate, multiple, unknown and invalid quantities are rejected',async()=>{
 for(const items of [[{id:planId,quantity:2}],[{id:planId},{id:planId}],[{id:planId},{id:'care-plan-6-months'}],[{id:'care-plan-free'}],[{id:planId,quantity:-1}],[{id:planId,quantity:1.5}]])await assert.rejects(()=>priceCart(db,items),e=>e.status===400);
});
test('A product cannot impersonate a Care Plan',async()=>{
 const q=await priceCart(db,[{id:productId,kind:'care-plan',price:0}]);assert.equal(q.deliveryFee,49);assert.equal(q.total,349);assert.equal(q.items[0].kind,undefined);
});
test('Payment must be captured and match account, amount and cart',async()=>{
 const oldFetch=global.fetch,oldKey=process.env.RAZORPAY_KEY_ID,oldSecret=process.env.RAZORPAY_KEY_SECRET;
 process.env.RAZORPAY_KEY_ID='test_key';process.env.RAZORPAY_KEY_SECRET='test_secret';
 const q=await priceCart(db,[{id:planId}]);
 const proof={razorpay_order_id:'order_Test',razorpay_payment_id:'pay_Test',razorpay_signature:crypto.createHmac('sha256','test_secret').update('order_Test|pay_Test').digest('hex')};
 let order={notes:{user_id:'user',cart_fingerprint:q.fingerprint},amount:16500,currency:'INR',status:'paid'};
 let payment={order_id:'order_Test',amount:16500,currency:'INR',status:'captured',amount_refunded:0};
 global.fetch=async url=>({ok:true,json:async()=>url.includes('/orders/')?order:payment});
 try {
  assert.equal(await verifyOrderPayment(proof,'user',q),'pay_Test');
  await assert.rejects(()=>verifyOrderPayment({...proof,razorpay_signature:'0'.repeat(64)},'user',q));
  await assert.rejects(()=>verifyOrderPayment(proof,'other-user',q));
  payment={...payment,status:'authorized'};await assert.rejects(()=>verifyOrderPayment(proof,'user',q));
  payment={...payment,status:'captured',amount:100};await assert.rejects(()=>verifyOrderPayment(proof,'user',q));
  payment={...payment,amount:16500};order={...order,notes:{user_id:'user',cart_fingerprint:'changed'}};await assert.rejects(()=>verifyOrderPayment(proof,'user',q));
 } finally {global.fetch=oldFetch;if(oldKey===undefined)delete process.env.RAZORPAY_KEY_ID;else process.env.RAZORPAY_KEY_ID=oldKey;if(oldSecret===undefined)delete process.env.RAZORPAY_KEY_SECRET;else process.env.RAZORPAY_KEY_SECRET=oldSecret;}
});
