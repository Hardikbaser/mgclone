const crypto = require('crypto');
async function verifyOrderPayment(payment, userId, quote) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = payment || {};
  const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  const reject = message => Object.assign(new Error(message), { status: 400 });
  if (!key || !secret) throw Object.assign(new Error('Online payments are not configured.'), { status: 503 });
  if (typeof orderId !== 'string' || !/^order_[a-zA-Z0-9]+$/.test(orderId) || typeof paymentId !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(paymentId) || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) throw reject('A verified online payment is required.');
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) throw reject('Payment verification failed.');
  const headers = { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` };
  const responses = await Promise.all([
    fetch(`https://api.razorpay.com/v1/orders/${orderId}`, { headers }),
    fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, { headers }),
  ]);
  if (responses.some(r => !r.ok)) throw reject('Unable to confirm payment. Please retry with your payment reference.');
  const [order, paid] = await Promise.all(responses.map(r => r.json()));
  const amount = Math.round(quote.total * 100);
  if (order.notes?.user_id !== userId || order.notes?.cart_fingerprint !== quote.fingerprint || order.amount !== amount || order.currency !== 'INR' || order.status !== 'paid' || paid.order_id !== orderId || paid.amount !== amount || paid.currency !== 'INR' || paid.status !== 'captured' || paid.amount_refunded > 0) throw reject('Payment does not match this account and cart, or is not captured yet.');
  return paymentId;
}
module.exports = { verifyOrderPayment };
