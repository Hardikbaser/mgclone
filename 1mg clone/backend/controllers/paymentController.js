const crypto = require('crypto');

const razorpayConfigured = () => process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    if (!razorpayConfigured()) return res.status(503).json({ message: 'Razorpay Test Mode keys are not configured.' });
    const rupees = Number(req.body?.amount);
    if (!Number.isFinite(rupees) || rupees <= 0) return res.status(400).json({ message: 'A valid payment amount is required.' });

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: Math.round(rupees * 100), currency: 'INR', receipt: `1mg_${Date.now()}`, notes: { user_id: req.user.id } }),
    });
    const payload = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: payload?.error?.description || 'Unable to create a Razorpay order.' });
    return res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, order: { id: payload.id, amount: payload.amount, currency: payload.currency } });
  } catch (error) { return next(error); }
};

exports.verifyRazorpayPayment = (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!razorpayConfigured() || !orderId || !paymentId || !signature) return res.status(400).json({ message: 'Incomplete Razorpay payment response.' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  const verified = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!verified) return res.status(400).json({ message: 'Payment verification failed.' });
  return res.json({ verified: true });
};
