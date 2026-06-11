import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { parseImages } from '../utils/helpers.js';

const router = Router();

const formatProduct = (row) => ({
  ...row,
  price: parseFloat(row.price),
  rating: parseFloat(row.rating),
  images: parseImages(row.images),
  specifications: row.specifications || {},
});

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sort, limit = 20, page = 1 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (featured === 'true') {
      conditions.push('p.featured = true');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    let orderBy = 'p.created_at DESC';

    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'rating') orderBy = 'p.rating DESC';
    if (sort === 'name') orderBy = 'p.name ASC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const { rows } = await pool.query(query, params);
    res.json(rows.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

router.get('/trending', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.rating DESC, p.review_count DESC
      LIMIT 8
    `);
    res.json(rows.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...formatProduct(rows[0]), reviews: reviews.rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    const product = await pool.query('SELECT category_id FROM products WHERE id = $1', [req.params.id]);
    if (!product.rows.length) return res.status(404).json({ message: 'Not found' });

    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = $1 AND p.id != $2 LIMIT 4`,
      [product.rows[0].category_id, req.params.id]
    );
    res.json(rows.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price, category_id, stock, images, specifications, featured } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, category_id, stock, images, specifications, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, price, category_id, stock || 0, JSON.stringify(images || []), JSON.stringify(specifications || {}), featured || false]
    );
    res.status(201).json(formatProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description, price, category_id, stock, images, specifications, featured } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, stock=$5,
       images=$6, specifications=$7, featured=$8 WHERE id=$9 RETURNING *`,
      [name, description, price, category_id, stock, JSON.stringify(images || []), JSON.stringify(specifications || {}), featured, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(formatProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
