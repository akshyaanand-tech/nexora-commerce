import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(p.id)::int as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id ORDER BY c.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, slug, description, image } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name, slug, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, image]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, slug, description, image } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE categories SET name=$1, slug=$2, description=$3, image=$4 WHERE id=$5 RETURNING *',
      [name, slug, description, image, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
