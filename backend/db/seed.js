import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const categories = [
  { name: 'Audio', slug: 'audio', description: 'Premium sound experiences', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80' },
  { name: 'Wearables', slug: 'wearables', description: 'Smart accessories for modern life', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
  { name: 'Home', slug: 'home', description: 'Elevated living essentials', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { name: 'Tech', slug: 'tech', description: 'Cutting-edge devices', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
];

const products = [
  {
    name: 'Nexora AirPods Pro',
    description: 'Immersive spatial audio with adaptive transparency. Crafted for those who demand clarity in every note.',
    price: 249.99,
    category: 'audio',
    stock: 45,
    rating: 4.8,
    review_count: 128,
    featured: true,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80'],
    specifications: { 'Battery Life': '30 hours', 'Driver': '11mm dynamic', 'Connectivity': 'Bluetooth 5.3', 'Weight': '5.4g each' },
  },
  {
    name: 'Horizon Watch Series X',
    description: 'A timepiece redefined. Titanium case, sapphire crystal, and health insights that adapt to your rhythm.',
    price: 399.00,
    category: 'wearables',
    stock: 32,
    rating: 4.9,
    review_count: 89,
    featured: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80'],
    specifications: { 'Display': '1.9" AMOLED', 'Case': 'Titanium', 'Water Resistance': '100m', 'Sensors': 'Heart rate, SpO2, GPS' },
  },
  {
    name: 'Lumina Desk Lamp',
    description: 'Sculptural lighting with circadian-aware warmth. Designed to complement, not compete with your space.',
    price: 189.00,
    category: 'home',
    stock: 28,
    rating: 4.7,
    review_count: 56,
    featured: true,
    images: ['https://images.unsplash.com/photo-1507473889965-d6af8b642cbd?w=800&q=80'],
    specifications: { 'Material': 'Brushed aluminum', 'Color Temp': '2700K-6500K', 'Dimming': 'Touch + App', 'Height': '18 inches' },
  },
  {
    name: 'Vertex Mechanical Keyboard',
    description: 'Precision-engineered switches with a whisper-quiet actuation. Built for creators who type with intention.',
    price: 279.00,
    category: 'tech',
    stock: 18,
    rating: 4.6,
    review_count: 74,
    featured: false,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
    specifications: { 'Switches': 'Linear silent', 'Layout': '75%', 'Connectivity': 'USB-C + Bluetooth', 'Keycaps': 'PBT double-shot' },
  },
  {
    name: 'Aura Wireless Speaker',
    description: 'Room-filling sound in a form factor that disappears into your interior. Acoustics meet architecture.',
    price: 349.00,
    category: 'audio',
    stock: 22,
    rating: 4.8,
    review_count: 41,
    featured: true,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
    specifications: { 'Output': '360° omnidirectional', 'Power': '40W RMS', 'Battery': '12 hours', 'Material': 'Woven fabric + aluminum' },
  },
  {
    name: 'Slate Laptop Stand',
    description: 'Ergonomic elevation with magnetic cable management. A single piece of folded aluminum, nothing more.',
    price: 79.00,
    category: 'tech',
    stock: 60,
    rating: 4.5,
    review_count: 112,
    featured: false,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
    specifications: { 'Material': '6061 aluminum', 'Angle': '15° fixed', 'Compatibility': 'Up to 17"', 'Weight': '1.2 lbs' },
  },
  {
    name: 'Meridian Leather Wallet',
    description: 'Full-grain leather that develops character over time. RFID shielding, zero bulk.',
    price: 95.00,
    category: 'wearables',
    stock: 40,
    rating: 4.7,
    review_count: 33,
    featured: false,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
    specifications: { 'Material': 'Italian full-grain leather', 'Capacity': '6 cards + cash', 'RFID': 'Yes', 'Dimensions': '4.3 x 3.1 in' },
  },
  {
    name: 'Canvas Throw Blanket',
    description: 'Organic cotton weave with a weight that feels intentional. The kind of comfort you notice immediately.',
    price: 129.00,
    category: 'home',
    stock: 35,
    rating: 4.9,
    review_count: 67,
    featured: true,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    specifications: { 'Material': '100% organic cotton', 'Size': '50 x 60 in', 'Weight': '3.5 lbs', 'Care': 'Machine washable' },
  },
];

async function seed() {
  try {
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash = await bcrypt.hash('user123', 12);

    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'admin@nexora.com', adminHash, 'admin']
    );
    const demoResult = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id`,
      ['Demo User', 'demo@nexora.com', userHash, 'user']
    );
    if (demoResult.rows.length) {
      await pool.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [demoResult.rows[0].id]);
    }

    const catMap = {};
    for (const cat of categories) {
      const { rows } = await pool.query(
        `INSERT INTO categories (name, slug, description, image) VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id, slug`,
        [cat.name, cat.slug, cat.description, cat.image]
      );
      catMap[cat.slug] = rows[0].id;
    }

    const { rows: existingProducts } = await pool.query('SELECT COUNT(*)::int as count FROM products');
    if (existingProducts[0].count === 0) {
      for (const p of products) {
        await pool.query(
          `INSERT INTO products (name, description, price, category_id, stock, images, rating, review_count, specifications, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [p.name, p.description, p.price, catMap[p.category], p.stock, JSON.stringify(p.images), p.rating, p.review_count, JSON.stringify(p.specifications), p.featured]
        );
      }
    }

    await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      ['NEXORA10', 'percentage', 10, 50]
    );
    await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      ['WELCOME20', 'fixed', 20, 100]
    );

    console.log('Seed data inserted successfully.');
    console.log('Admin: admin@nexora.com / admin123');
    console.log('User:  demo@nexora.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
