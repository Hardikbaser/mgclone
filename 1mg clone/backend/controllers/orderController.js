const { postgres } = require('../config/database');
const { priceCart } = require('../utils/cartPricing');
const { verifyOrderPayment } = require('../utils/verifyOrderPayment');

exports.create = async (req, res, next) => {
 let client;
 try {
  client = await postgres.connect();
  const { items, totalAmount, paymentMethod, deliveryAddress = {}, payment } = req.body;
  if (!Array.isArray(items) || !items.length || !Number.isFinite(Number(totalAmount))) return res.status(400).json({message:'Order items and total amount are required.'});
  if (!['UPI','CARD','NET_BANKING','CASH_ON_DELIVERY'].includes(paymentMethod)) return res.status(400).json({message:'Choose a supported payment method.'});
  const validAddress = deliveryAddress && typeof deliveryAddress === 'object' && ['name','line1','city','state'].every(k => typeof deliveryAddress[k] === 'string' && deliveryAddress[k].trim()) && /^\d{10}$/.test(deliveryAddress.phone) && /^\d{6}$/.test(deliveryAddress.pincode);
  if (!validAddress) return res.status(400).json({message:'A complete billing or delivery address is required.'});
  await client.query('BEGIN');
  await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
  if (payment?.razorpay_payment_id) {
   const existing = await client.query('SELECT id, status, total_amount, created_at FROM orders WHERE user_id=$1 AND payment_id=$2', [req.user.id,payment.razorpay_payment_id]);
   if (existing.rows[0]) { await client.query('COMMIT'); return res.json({order:existing.rows[0]}); }
  }
  const quote = await priceCart(client, items, true);
  const membership = quote.items.find(item => item.kind === 'care-plan');
  if (membership && paymentMethod === 'CASH_ON_DELIVERY') throw Object.assign(new Error('Care Plans require online payment.'),{status:400});
  if (Math.abs(quote.total-Number(totalAmount))>0.01) throw Object.assign(new Error('Order total has changed. Refresh your cart and try again.'),{status:400});
  const paymentId = paymentMethod === 'CASH_ON_DELIVERY' ? null : await verifyOrderPayment(payment, req.user.id, quote);
  for (const item of quote.items.filter(item => item.kind !== 'care-plan')) await client.query('UPDATE products SET stock=stock-$1, updated_at=NOW() WHERE id=$2', [item.quantity,item.id]);
  const { rows } = await client.query('INSERT INTO orders (user_id,items,total_amount,payment_method,delivery_address,payment_id) VALUES ($1,$2::jsonb,$3,$4,$5::jsonb,$6) RETURNING id,status,total_amount,created_at', [req.user.id,JSON.stringify(quote.items),quote.total,paymentMethod,JSON.stringify(deliveryAddress),paymentId]);
  if (membership) await client.query(`INSERT INTO care_memberships(user_id,order_id,plan_id,duration_months,starts_at,expires_at)
   SELECT $1,$2,$3,$4,starts,starts+make_interval(months => $4) FROM
   (SELECT GREATEST(NOW(),COALESCE(MAX(expires_at),NOW())) AS starts FROM care_memberships WHERE user_id=$1) current_plan`, [req.user.id,rows[0].id,membership.id,membership.durationMonths]);
  await client.query('DELETE FROM carts WHERE user_id=$1',[req.user.id]);
  await client.query('COMMIT');
  res.status(201).json({order:rows[0]});
 } catch(error) { if(client) await client.query('ROLLBACK'); next(error); } finally {client?.release();}
};

exports.list = async (req, res, next) => {
  try {
    const { rows } = await postgres.query('SELECT o.id, o.items, o.total_amount::float, o.payment_method, o.status, o.created_at, m.starts_at AS membership_starts_at, m.expires_at AS membership_expires_at FROM orders o LEFT JOIN care_memberships m ON m.order_id=o.id WHERE o.user_id = $1 ORDER BY o.created_at DESC', [req.user.id]);
    res.json({ orders: rows });
  } catch (error) { next(error); }
};
