import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { parseImages, calculateTax, calculateShipping } from '../utils/helpers.js';

const router = Router();

const getOrCreateCart = async (userId) => {
  let { rows } = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (!rows.length) {
    ({ rows } = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]));
  }
  return rows[0];
};

const getCartItems = async (cartId) => {
  const { rows } = await pool.query(
    `SELECT ci.*, p.name, p.price, p.images, p.stock, p.rating
     FROM cart_items ci JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return rows.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    rating: parseFloat(item.rating),
    images: parseImages(item.images),
  }));
};

const calculateSummary = async (cart, items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;

  if (cart.coupon_code) {
    const { rows } = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND active = true AND (expires_at IS NULL OR expires_at > NOW())',
      [cart.coupon_code]
    );
    if (rows.length && subtotal >= parseFloat(rows[0].min_order)) {
      const coupon = rows[0];
      discount =
        coupon.discount_type === 'percentage'
          ? subtotal * (parseFloat(coupon.discount_value) / 100)
          : parseFloat(coupon.discount_value);
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = calculateTax(afterDiscount);
  const shipping = calculateShipping(afterDiscount);
  const total = afterDiscount + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax,
    shipping,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

router.get('/', authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary, coupon: cart.coupon_code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add', authenticate, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const cart = await getOrCreateCart(req.user.id);
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );

    if (existing.rows.length) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cart.id, productId, quantity]
      );
    }

    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update', authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await getOrCreateCart(req.user.id);
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cart.id, productId]);
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
        [quantity, cart.id, productId]
      );
    }
    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cart.id, req.params.productId]);
    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/coupon', authenticate, async (req, res) => {
  const { code } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND active = true',
      [code.toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ message: 'Invalid coupon code' });

    const cart = await getOrCreateCart(req.user.id);
    await pool.query('UPDATE carts SET coupon_code = $1 WHERE id = $2', [code.toUpperCase(), cart.id]);
    cart.coupon_code = code.toUpperCase();

    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary, coupon: cart.coupon_code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/coupon', authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await pool.query('UPDATE carts SET coupon_code = NULL WHERE id = $1', [cart.id]);
    cart.coupon_code = null;
    const items = await getCartItems(cart.id);
    const summary = await calculateSummary(cart, items);
    res.json({ items, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
