'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { LocateFixed, MapPin, PackageOpen, Search, ShoppingCart, Star, X } from 'lucide-react';
import { readApiError } from '../../lib/api';
import { useCartStore } from '../../lib/useCartStore';
import styles from './page.module.css';

type Product = { _id?: string; id?: string; name?: string; brand?: string; composition?: string; price?: number; mrp?: number; category?: string; image?: string; isRxRequired?: boolean; stock?: number };
const API = 'http://localhost:5000/api/products';
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const productId = (product: Product) => String(product._id ?? product.id ?? product.name ?? 'product');

function Skeleton() {
  return <article className={styles.skeleton}><i /><b /><span /><em /></article>;
}

function ProductCard({ product, quantity, onQuantityChange }: { product: Product; quantity: number; onQuantityChange: (product: Product, quantity: number) => void }) {
  const price = number(product.price);
  const mrp = number(product.mrp);
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return <article className={styles.card}>
    <div className={styles.image}>
      {product.image ? <img src={product.image} alt={product.name || 'Product'} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <PackageOpen size={43} />}
    </div>
    <div className={styles.cardBody}>
      <h2>{product.name || 'Health product'}</h2>
      {product.brand && <p>{product.brand}</p>}
      {product.composition && <small>{product.composition}</small>}
      <span className={styles.rating}><Star size={11} fill="currentColor" />4.5 <i>(120)</i></span>
      <span className={styles.delivery}>Get by Tomorrow</span>
      <div className={styles.price}><b>{money(price)}</b>{mrp > price && <><del>{money(mrp)}</del><em>{off}% off</em></>}</div>
      {product.isRxRequired && <span className={styles.rx}>Prescription required</span>}
      {product.stock === 0 ? <button disabled>OUT OF STOCK</button> : quantity === 0 ? (
        <button onClick={() => onQuantityChange(product, 1)}>ADD TO CART</button>
      ) : (
        <div className={styles.quantityControl} aria-label={`${product.name || 'Product'} quantity`}>
          <button onClick={() => onQuantityChange(product, quantity - 1)} aria-label={`Decrease ${product.name || 'product'} quantity`}>−</button>
          <b>{quantity}</b>
          <button onClick={() => onQuantityChange(product, quantity + 1)} aria-label={`Increase ${product.name || 'product'} quantity`}>+</button>
        </div>
      )}
    </div>
  </article>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [location, setLocation] = useState('Gurgaon');
  const [locationDraft, setLocationDraft] = useState('Gurgaon');
  const [locationOpen, setLocationOpen] = useState(false);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartItems = useCartStore((state) => state.items);

  const loadProducts = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(await readApiError(response, 'Unable to load products right now.'));
      const payload = await response.json();
      setProducts(Array.isArray(payload?.products) ? payload.products : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load products right now.');
    } finally { setLoading(false); }
  };
  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))).sort()], [products]);
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matchingProducts = products.filter((product) => {
      const text = `${product.name || ''} ${product.brand || ''} ${product.composition || ''}`.toLowerCase();
      return (category === 'All' || product.category === category) && (!term || text.includes(term));
    });
    const uniqueProducts = new Map<string, Product>();
    matchingProducts.forEach((product) => {
      const key = (product.name || productId(product)).trim().toLowerCase();
      const existing = uniqueProducts.get(key);
      const hasUsableImage = Boolean(product.image && !product.image.endsWith('product-placeholder.svg'));
      const existingHasUsableImage = Boolean(existing?.image && !existing.image.endsWith('product-placeholder.svg'));
      if (!existing || (hasUsableImage && !existingHasUsableImage)) uniqueProducts.set(key, product);
    });
    return Array.from(uniqueProducts.values());
  }, [products, search, category]);
  const updateProductQuantity = async (product: Product, quantity: number) => {
    try {
      await setItemQuantity({ id: productId(product), name: product.name || 'Product', price: number(product.price), image: product.image, rx: Boolean(product.isRxRequired) }, quantity);
      setNotice(quantity > 0 ? 'Cart updated' : 'Removed from cart');
      window.setTimeout(() => setNotice(''), 1800);
    } catch {
      setError('Unable to update this product in the cart. Please try again.');
    }
  };
  const saveLocation = (event: FormEvent) => { event.preventDefault(); setLocation(locationDraft.trim() || 'Gurgaon'); setLocationOpen(false); };
  const cartItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><span>1</span>mg</Link>
      <button className={styles.location} onClick={() => setLocationOpen(true)}><MapPin size={19} /><b>{location}</b><LocateFixed size={18} /></button>
      <form className={styles.search} onSubmit={(event) => { event.preventDefault(); setSearch(search.trim()); }}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for Medicines and Health Products" /><Search size={20} /><button className={styles.searchButton}>Search</button></form>
      <p className={styles.quickBuy}>⚡ <b>QUICK BUY!</b> Get up to 25% off on medicines*</p>
      <button className={styles.quickOrder}>Quick order</button>
      <button className={styles.cart} onClick={toggleCart} aria-label="Open cart"><ShoppingCart size={21} /><i>{cartItemCount}</i></button>
    </header>
    <nav className={styles.categoryRow} aria-label="Product categories">{categories.map((item) => <button key={item} className={category === item ? styles.activeCategory : ''} onClick={() => setCategory(item)}>{item}</button>)}</nav>
    <section className={styles.content}>
      {error && <div className={styles.error}>{error}<button onClick={loadProducts}>Try again</button></div>}
      {notice && <div className={styles.notice}>{notice}</div>}
      {loading ? <div className={styles.grid}>{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} />)}</div> : shown.length ? <section className={styles.collection}><div className={styles.collectionHead}><h1>Products</h1><span>{shown.length} products</span></div><div className={styles.productGrid}>{shown.map((product) => <ProductCard key={productId(product)} product={product} quantity={cartItems.find((item) => item.id === productId(product))?.quantity || 0} onQuantityChange={updateProductQuantity} />)}</div></section> : <div className={styles.empty}><PackageOpen size={34} /><h2>No products found</h2><p>Try another category or search term.</p><button onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters</button></div>}
    </section>
    {locationOpen && <div className={styles.modalBackdrop} onMouseDown={() => setLocationOpen(false)}><form className={styles.locationModal} onSubmit={saveLocation} onMouseDown={(event) => event.stopPropagation()}><button className={styles.close} type="button" onClick={() => setLocationOpen(false)}><X size={18} /></button><h2>Choose delivery location</h2><p>Enter your city or pincode to check delivery availability.</p><input autoFocus value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} placeholder="e.g. Gurgaon or 122001" /><button className={styles.saveLocation}>Save location</button></form></div>}
  </main>;
}
