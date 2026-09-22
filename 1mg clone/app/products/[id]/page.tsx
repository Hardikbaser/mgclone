'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './detail.module.css';
import { PackageOpen } from 'lucide-react';
import { apiFetch, readApiError } from '../../../lib/api';
import { useCartStore } from '../../../lib/useCartStore';

type Product = { id: string; name: string; description: string; composition: string; brand: string; category: string; price: number; mrp: number; stock: number; image: string; isRxRequired: boolean };
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState('');
  const [busy, setBusy] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    apiFetch(`/products/${id}`).then(async (response) => {
      if (!response.ok) throw new Error(await readApiError(response, 'Product not found.'));
      return response.json();
    }).then((payload) => setProduct(payload.product)).catch((cause: Error) => setError(cause.message));
  }, [id]);

  if (error) return <main style={{ margin: '80px auto', maxWidth: 960 }}><h1>{error}</h1><Link href="/products">Back to products</Link></main>;
  if (!product) return <main style={{ margin: '80px auto', maxWidth: 960 }}>Loading product…</main>;
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  return <main className={styles.page}>
    <Link href="/products">← Back to products</Link>
    <section className={styles.detail}>
      <div style={{ alignItems: 'center', border: '1px solid #eee', display: 'grid', minHeight: 340, padding: 24, placeItems: 'center' }}>{product.image ? <img src={product.image} alt={product.name} style={{ maxHeight: 300, maxWidth: '100%', objectFit: 'contain' }} /> : <PackageOpen size={70} />}</div>
      <div><p style={{ color: '#666' }}>{product.brand} · {product.category}</p><h1>{product.name}</h1><p>{product.composition}</p>{product.isRxRequired && <p style={{ color: '#b23', fontWeight: 700 }}>Prescription required</p>}<p><b style={{ fontSize: 28 }}>{money(product.price)}</b> <del>{money(product.mrp)}</del> {discount > 0 && <span style={{ color: '#168342' }}>{discount}% off</span>}</p><p>{product.stock ? `${product.stock} units available` : 'Out of stock'}</p><label>Quantity <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{Array.from({ length: Math.min(product.stock, 10) }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label><br /><button disabled={!product.stock || busy} onClick={async () => {setBusy(true);setCartError('');try {await addItem({ id: product.id, name: product.name, price: product.price, image: product.image, rx: product.isRxRequired, quantity })} catch(e) {setCartError(e instanceof Error?e.message:'Unable to add to cart. Please sign in.')} finally {setBusy(false)}}} style={{ background: '#ff6f61', border: 0, color: '#fff', cursor: 'pointer', marginTop: 18, padding: '13px 20px' }}>Add to cart</button>{cartError && <p role="alert" className="error-box">{cartError}</p>}<h2>Description</h2><p>{product.description || 'Product details will be updated shortly.'}</p></div>
    </section>
  </main>;
}
