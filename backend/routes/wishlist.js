import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { parseImages } from '../utils/helpers.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT w.id as wishlist_id, p.* FROM wishlist w
       JOIN products p ON w.product_id = p.id WHERE w.user_id = $1`,
      [req.user.id]
    );
    res.json(
      rows.map((r) => ({
        wishlist_id: r.wishlist_id,
        ...r,
        price: parseFloat(r.price),
        rating: parseFloat(r.rating),
        images: parseImages(r.images),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [
      req.user.id,
      req.params.productId,
    ]);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
