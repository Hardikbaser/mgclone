'use client';

import { useState } from 'react';

/**
 * A standalone Tata 1mg-inspired product card.
 * `onAddToCart` is optional and receives (product, quantity).
 */
export default function OneMgProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(0);

  const safeMrp = Number(product?.mrp) || 0;
  const safeDiscount = Math.min(100, Math.max(0, Number(product?.discountPercent) || 0));
  const finalPrice = safeMrp * (1 - safeDiscount / 100);

  const updateQuantity = (nextQuantity) => {
    const next = Math.max(0, nextQuantity);
    setQuantity(next);

    if (typeof onAddToCart === 'function') {
      onAddToCart(product, next);
    }
  };

  const styles = {
    card: {
      background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10,
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 220, padding: 14, position: 'relative', width: '100%',
    },
    image: { height: 142, objectFit: 'contain', width: '100%' },
    imageFallback: {
      alignItems: 'center', background: '#f7f7f7', color: '#777', display: 'flex',
      fontSize: 13, height: 142, justifyContent: 'center', width: '100%',
    },
    title: { color: '#212121', fontSize: 15, fontWeight: 600, lineHeight: 1.35, margin: 0 },
    meta: { color: '#757575', fontSize: 12, lineHeight: 1.5, margin: 0 },
    rx: {
      alignSelf: 'flex-start', background: '#fff0ee', borderRadius: 3, color: '#d83a2e',
      fontSize: 10, fontWeight: 700, padding: '3px 6px',
    },
    pricing: { alignItems: 'baseline', display: 'flex', flexWrap: 'wrap', gap: 7 },
    price: { color: '#212121', fontSize: 17, fontWeight: 700 },
    mrp: { color: '#8b8b8b', fontSize: 12, textDecoration: 'line-through' },
    discount: { color: '#16843a', fontSize: 12, fontWeight: 700 },
    add: {
      background: '#fff', border: '1px solid #ff6f61', borderRadius: 5, color: '#ff6f61',
      cursor: 'pointer', fontSize: 13, fontWeight: 700, minHeight: 34, width: '100%',
    },
    counter: { alignItems: 'center', border: '1px solid #ff6f61', borderRadius: 5, display: 'flex', overflow: 'hidden' },
    counterButton: { background: '#fff8f7', border: 0, color: '#ff6f61', cursor: 'pointer', fontSize: 18, height: 34, width: 38 },
    counterValue: { color: '#212121', flex: 1, fontSize: 14, fontWeight: 700, textAlign: 'center' },
  };

  return (
    <article style={styles.card} aria-label={product?.title || 'Product'}>
      {product?.image ? (
        <img src={product.image} alt={product.title || 'Product'} style={styles.image} />
      ) : (
        <div style={styles.imageFallback}>Product image</div>
      )}

      {product?.isRxRequired && <span style={styles.rx}>PRESCRIPTION REQUIRED</span>}
      <div>
        <h3 style={styles.title}>{product?.title || 'Health product'}</h3>
        {product?.packSize && <p style={styles.meta}>{product.packSize}</p>}
        {product?.manufacturer && <p style={styles.meta}>By {product.manufacturer}</p>}
      </div>

      <div style={styles.pricing}>
        <span style={styles.price}>₹{finalPrice.toFixed(2)}</span>
        {safeDiscount > 0 && <span style={styles.mrp}>MRP ₹{safeMrp.toFixed(2)}</span>}
        {safeDiscount > 0 && <span style={styles.discount}>{safeDiscount}% off</span>}
      </div>

      {quantity === 0 ? (
        <button type="button" style={styles.add} onClick={() => updateQuantity(1)}>ADD</button>
      ) : (
        <div style={styles.counter} aria-label={`${product?.title || 'Product'} quantity`}>
          <button type="button" style={styles.counterButton} onClick={() => updateQuantity(quantity - 1)} aria-label="Decrease quantity">−</button>
          <span style={styles.counterValue}>{quantity}</span>
          <button type="button" style={styles.counterButton} onClick={() => updateQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
        </div>
      )}
    </article>
  );
}
