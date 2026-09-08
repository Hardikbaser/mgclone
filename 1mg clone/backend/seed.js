require('dotenv').config();
const Product = require('./models/Product');
const { connectDatabases } = require('./config/database');

const products = [
  { name: 'Dolo 650mg Tablet', composition: 'Paracetamol 650mg', price: 32, mrp: 38, brand: 'Micro Labs', category: 'Pain relief', stock: 120 },
  { name: 'Calpol 650mg Tablet', composition: 'Paracetamol 650mg', price: 28, mrp: 35, brand: 'GlaxoSmithKline', category: 'Pain relief', stock: 80 },
  { name: 'Azithral 500mg Tablet', composition: 'Azithromycin 500mg', price: 112, mrp: 128, brand: 'Alembic', category: 'Antibiotics', isRxRequired: true, stock: 40 },
  { name: 'Cetirizine 10mg Tablet', composition: 'Cetirizine 10mg', price: 19, mrp: 24, brand: 'Dr Reddy’s', category: 'Allergy care', stock: 100 },
  { name: 'Shelcal 500mg Tablet', composition: 'Calcium Carbonate 500mg', price: 104, mrp: 120, brand: 'Torrent', category: 'Vitamins', stock: 65 },
];

connectDatabases().then(async () => { await Product.deleteMany({}); await Product.insertMany(products); console.log('Product catalog seeded'); process.exit(0); }).catch((error) => { console.error(error); process.exit(1); });
