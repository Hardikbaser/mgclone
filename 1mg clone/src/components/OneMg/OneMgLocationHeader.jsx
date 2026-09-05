'use client';

import { useState } from 'react';

const categories = ['Medicines', 'Lab Tests', 'Consults'];

/**
 * A standalone location and search bar. Consumers can optionally receive the
 * selected location and search text through `onLocationChange` and `onSearch`.
 */
export default function OneMgLocationHeader({
  initialLocation = 'your city',
  onLocationChange,
  onSearch,
}) {
  const [location, setLocation] = useState(initialLocation);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState(initialLocation);
  const [search, setSearch] = useState('');

  const submitLocation = (event) => {
    event.preventDefault();
    const nextLocation = draftLocation.trim() || initialLocation;
    setLocation(nextLocation);
    setIsModalOpen(false);
    if (typeof onLocationChange === 'function') onLocationChange(nextLocation);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (typeof onSearch === 'function') onSearch(search.trim());
  };

  const styles = {
    wrapper: { background: '#fff', borderBottom: '1px solid #e8e8e8', color: '#212121', fontFamily: 'Arial, sans-serif', padding: '10px 16px' },
    row: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 12, margin: '0 auto', maxWidth: 1200 },
    locationButton: { background: 'transparent', border: 0, color: '#333', cursor: 'pointer', fontSize: 13, padding: '8px 0', textAlign: 'left' },
    locationValue: { color: '#ff6f61', fontWeight: 700 },
    searchForm: { display: 'flex', flex: '1 1 360px', minWidth: 240 },
    searchInput: { border: '1px solid #d9d9d9', borderRadius: '5px 0 0 5px', fontSize: 14, minWidth: 0, outlineColor: '#ff6f61', padding: '10px 12px', width: '100%' },
    searchButton: { background: '#ff6f61', border: 0, borderRadius: '0 5px 5px 0', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: '0 18px' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: 7, margin: '4px auto 0', maxWidth: 1200 },
    tag: { background: '#f6f6f6', border: 0, borderRadius: 14, color: '#5d5d5d', cursor: 'pointer', fontSize: 12, padding: '6px 11px' },
    overlay: { alignItems: 'center', background: 'rgba(0, 0, 0, 0.45)', display: 'flex', inset: 0, justifyContent: 'center', padding: 16, position: 'fixed', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 8, boxShadow: '0 12px 32px rgba(0,0,0,0.22)', maxWidth: 390, padding: 22, width: '100%' },
    modalInput: { border: '1px solid #d2d2d2', borderRadius: 4, boxSizing: 'border-box', fontSize: 14, margin: '12px 0', padding: 10, width: '100%' },
    modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
    cancel: { background: '#fff', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', padding: '8px 13px' },
    save: { background: '#ff6f61', border: 0, borderRadius: 4, color: '#fff', cursor: 'pointer', fontWeight: 700, padding: '8px 13px' },
  };

  return (
    <section style={styles.wrapper} aria-label="Delivery location and product search">
      <div style={styles.row}>
        <button type="button" style={styles.locationButton} onClick={() => setIsModalOpen(true)}>
          Deliver to <span style={styles.locationValue}>{location}</span> ▾
        </button>
        <form style={styles.searchForm} onSubmit={submitSearch}>
          <input style={styles.searchInput} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for medicines, tests and health products" aria-label="Search products" />
          <button type="submit" style={styles.searchButton}>Search</button>
        </form>
      </div>
      <div style={styles.tags} aria-label="Search categories">
        {categories.map((category) => <button key={category} type="button" style={styles.tag} onClick={() => { setSearch(category); if (typeof onSearch === 'function') onSearch(category); }}>{category}</button>)}
      </div>

      {isModalOpen && (
        <div style={styles.overlay} role="presentation" onMouseDown={() => setIsModalOpen(false)}>
          <form style={styles.modal} onSubmit={submitLocation} role="dialog" aria-modal="true" aria-labelledby="location-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="location-title" style={{ fontSize: 18, margin: 0 }}>Choose delivery location</h2>
            <p style={{ color: '#666', fontSize: 13 }}>Enter a pincode or city to see availability.</p>
            <input autoFocus style={styles.modalInput} value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)} placeholder="e.g. 560001 or Bengaluru" />
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" style={styles.save}>Save location</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
