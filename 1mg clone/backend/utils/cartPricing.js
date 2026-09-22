const crypto = require('crypto');
const plans = require('../../lib/care-plans.json');
const fail = message => Object.assign(new Error(message), { status: 400 });

async function priceCart(db, items, lock = false) {
  if (!Array.isArray(items)) throw fail('Cart items must be an array.');
  const quantities = new Map();
  for (const item of items) {
    if (!item || typeof item.id !== 'string') throw fail('Each item needs a valid id.');
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000) throw fail('Invalid item quantity.');
    quantities.set(item.id, (quantities.get(item.id) || 0) + quantity);
  }
  const memberships = plans.filter(plan => quantities.has(plan.id));
  if (memberships.length > 1 || memberships.some(plan => quantities.get(plan.id) !== 1)) throw fail('Choose one Care Plan per order.');
  const ids = [...quantities.keys()].filter(id => !plans.some(plan => plan.id === id));
  if (ids.some(id => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) throw fail('One or more items are unavailable.');
  const products = ids.length ? await db.query(`SELECT id, name, price::float, stock, image, is_rx_required AS rx FROM products WHERE id = ANY($1::uuid[])${lock ? ' ORDER BY id FOR UPDATE' : ''}`, [ids]) : { rows: [] };
  if (products.rows.length !== ids.length) throw fail('One or more products are unavailable.');
  const trustedItems = products.rows.map(product => {
    const quantity = quantities.get(product.id);
    if (quantity > product.stock) throw fail(`${product.name} has only ${product.stock} in stock.`);
    return { id: product.id, name: product.name, price: product.price, image: product.image, rx: product.rx, quantity };
  });
  const goodsSubtotal = trustedItems.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
  for (const plan of memberships) trustedItems.push({ id: plan.id, name: plan.name, price: plan.price, image: plan.image, kind: 'care-plan', durationMonths: plan.months, quantity: 1 });
  const subtotal = goodsSubtotal + memberships.reduce((sum, plan) => sum + plan.price, 0);
  const deliveryFee = products.rows.length ? 49 : 0;
  const discount = goodsSubtotal >= 499 ? 50 : 0;
  const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(trustedItems.map(({ id, quantity, price }) => ({ id, quantity, price })).sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  return { items: trustedItems, subtotal, deliveryFee, discount, total, fingerprint };
}
module.exports = { priceCart };
