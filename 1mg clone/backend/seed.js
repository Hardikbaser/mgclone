require('dotenv').config();
const { connectDatabases, postgres } = require('./config/database');

const asset = (name) => `/assets/products/${name}`;
const products = [
  { name: 'Dolo 650mg Tablet', composition: 'Paracetamol 650mg', price: 32, mrp: 38, brand: 'Micro Labs', category: 'Pain relief', stock: 120, image: asset('dolo-650.jpg') },
  { name: 'Calpol 650mg Tablet', composition: 'Paracetamol 650mg', price: 28, mrp: 35, brand: 'GlaxoSmithKline', category: 'Pain relief', stock: 80, image: asset('calpol-650.jpg') },
  { name: 'Azithral 500mg Tablet', composition: 'Azithromycin 500mg', price: 112, mrp: 128, brand: 'Alembic', category: 'Antibiotics', isRxRequired: true, stock: 40, image: asset('azithral-500.jpg') },
  { name: 'Cetirizine 10mg Tablet', composition: 'Cetirizine 10mg', price: 19, mrp: 24, brand: "Dr Reddy's", category: 'Allergy care', stock: 100, image: asset('cetirizine-10.jpg') },
  { name: 'Shelcal 500mg Tablet', composition: 'Calcium Carbonate 500mg', price: 104, mrp: 120, brand: 'Torrent', category: 'Vitamins', stock: 65, image: asset('shelcal-500.jpg') },
  { name: 'HealthKart Multivitamin Tablet', composition: 'Daily multivitamin', price: 499, mrp: 699, brand: 'HealthKart', category: 'Vitamins', stock: 90, image: asset('healthkart-multivitamin.jpg') },
  { name: 'Vitamin D3 60K Softgel', composition: 'Cholecalciferol 60000 IU', price: 105, mrp: 126, brand: 'Sun Pharma', category: 'Vitamins', isRxRequired: true, stock: 55, image: asset('vitamin-d3-60k.jpg') },
  { name: 'Zincovit Tablet', composition: 'Multivitamin and minerals', price: 96, mrp: 115, brand: 'Apex Laboratories', category: 'Vitamins', stock: 72, image: asset('zincovit.jpg') },
  { name: 'Ensure Diabetes Care Powder', composition: 'Nutritional supplement', price: 725, mrp: 850, brand: 'Abbott', category: 'Wellness', stock: 38, image: asset('ensure-diabetes-care.jpg') },
  { name: 'Himalaya Ashwagandha Tablet', composition: 'Ashwagandha extract', price: 213, mrp: 260, brand: 'Himalaya', category: 'Wellness', stock: 84, image: asset('himalaya-ashwagandha.jpg') },
  { name: 'Zandu Balm', composition: 'Herbal pain relief balm', price: 75, mrp: 85, brand: 'Zandu', category: 'Pain relief', stock: 100, image: asset('zandu-balm.jpg') },
  { name: 'Volini Pain Relief Gel', composition: 'Diclofenac topical gel', price: 189, mrp: 225, brand: 'Sun Pharma', category: 'Pain relief', stock: 67, image: asset('volini-gel.jpg') },
  { name: 'Moov Pain Relief Cream', composition: 'Topical pain relief cream', price: 148, mrp: 180, brand: 'Reckitt', category: 'Pain relief', stock: 61, image: asset('moov-cream.jpg') },
  { name: 'Iodex Rapid Action Spray', composition: 'Topical pain relief spray', price: 169, mrp: 210, brand: 'GSK', category: 'Pain relief', stock: 49, image: asset('iodex-spray.jpg') },
  { name: 'Cetaphil Moisturising Cream', composition: 'Moisturising cream', price: 699, mrp: 825, brand: 'Cetaphil', category: 'Skin care', stock: 43, image: asset('cetaphil-moisturising-cream.jpg') },
  { name: 'Nivea Soft Moisturising Cream', composition: 'Daily moisturiser', price: 299, mrp: 350, brand: 'Nivea', category: 'Skin care', stock: 96, image: asset('nivea-soft-cream.jpg') },
  { name: 'Minimalist Salicylic Acid Cleanser', composition: '2% Salicylic acid cleanser', price: 284, mrp: 299, brand: 'Minimalist', category: 'Skin care', stock: 57, image: asset('minimalist-salicylic-cleanser.jpg') },
  { name: 'Mamaearth Ubtan Face Wash', composition: 'Turmeric and saffron face wash', price: 229, mrp: 279, brand: 'Mamaearth', category: 'Skin care', stock: 81, image: asset('mamaearth-ubtan-face-wash.jpg') },
  { name: 'Dove Daily Shine Shampoo', composition: 'Nourishing shampoo', price: 195, mrp: 235, brand: 'Dove', category: 'Hair care', stock: 74, image: asset('dove-daily-shine-shampoo.jpg') },
  { name: 'Himalaya Anti Hair Fall Oil', composition: 'Herbal hair oil', price: 156, mrp: 190, brand: 'Himalaya', category: 'Hair care', stock: 69, image: asset('himalaya-hair-fall-oil.jpg') },
  { name: 'Colgate Strong Teeth Toothpaste', composition: 'Fluoride toothpaste', price: 115, mrp: 135, brand: 'Colgate', category: 'Personal care', stock: 110, image: asset('colgate-strong-teeth.jpg') },
  { name: 'Savlon Handwash', composition: 'Germ protection handwash', price: 99, mrp: 120, brand: 'Savlon', category: 'Personal care', stock: 88, image: asset('savlon-handwash.jpg') },
  { name: 'Dettol Original Soap', composition: 'Antibacterial soap', price: 54, mrp: 65, brand: 'Dettol', category: 'Personal care', stock: 140, image: asset('dettol-original-soap.jpg') },
  { name: 'Vicks Vaporub', composition: 'Menthol and camphor balm', price: 88, mrp: 105, brand: 'Vicks', category: 'Cold and cough', stock: 92, image: asset('vicks-vaporub.jpg') },
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

connectDatabases().then(async () => {
  for (const product of products) {
    await postgres.query(
      `INSERT INTO products (name, slug, composition, brand, category, price, mrp, stock, image, is_rx_required)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, composition=EXCLUDED.composition, brand=EXCLUDED.brand, category=EXCLUDED.category, price=EXCLUDED.price, mrp=EXCLUDED.mrp, stock=EXCLUDED.stock, image=EXCLUDED.image, is_rx_required=EXCLUDED.is_rx_required, updated_at=NOW()`,
      [product.name, slugify(product.name), product.composition, product.brand, product.category, product.price, product.mrp, product.stock, product.image, Boolean(product.isRxRequired)],
    );
  }
  console.log(`PostgreSQL product catalog seeded (${products.length} products).`);
  await postgres.end();
}).catch(async (error) => { console.error(error); await postgres.end(); process.exitCode = 1; });
