import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generateOrderNumber, calculateTax, calculateShipping, parseImages } from '../utils/helpers.js';

const router = Router();

router.post('/', authenticate, async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cartResult = await client.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    if (!cartResult.rows.length) throw new Error('Cart not found');
    const cart = cartResult.rows[0];

    const itemsResult = await client.query(
      `SELECT ci.*, p.name, p.price, p.stock FROM cart_items ci
       JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1`,
      [cart.id]
    );

    if (!itemsResult.rows.length) throw new Error('Cart is empty');

    let subtotal = 0;
    let discount = 0;

    for (const item of itemsResult.rows) {
      if (item.stock < item.quantity) throw new Error(`${item.name} is out of stock`);
      subtotal += parseFloat(item.price) * item.quantity;
    }

    if (cart.coupon_code) {
      const couponResult = await client.query(
        'SELECT * FROM coupons WHERE code = $1 AND active = true',
        [cart.coupon_code]
      );
      if (couponResult.rows.length) {
        const coupon = couponResult.rows[0];
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
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, total_amount, subtotal, tax, shipping, discount, status, shipping_address, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', $8, $9) RETURNING *`,
      [orderNumber, req.user.id, total, subtotal, tax, shipping, discount, JSON.stringify(shippingAddress), paymentMethod]
    );

    const order = orderResult.rows[0];

    for (const item of itemsResult.rows) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, product_name) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.product_id, item.quantity, item.price, item.name]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    await client.query('UPDATE carts SET coupon_code = NULL WHERE id = $1', [cart.id]);

    await client.query('COMMIT');
    res.status(201).json({
      order: {
        ...order,
        total_amount: parseFloat(order.total_amount),
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        shipping: parseFloat(order.shipping),
        discount: parseFloat(order.discount),
      },
      orderNumber,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(
      rows.map((o) => ({
        ...o,
        total_amount: parseFloat(o.total_amount),
        subtotal: parseFloat(o.subtotal),
        tax: parseFloat(o.tax),
        shipping: parseFloat(o.shipping),
        discount: parseFloat(o.discount),
        shipping_address: o.shipping_address,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Order not found' });

    const order = rows[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const items = await pool.query(
      `SELECT oi.*, p.images FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({
      ...order,
      total_amount: parseFloat(order.total_amount),
      items: items.rows.map((i) => ({ ...i, price: parseFloat(i.price), images: parseImages(i.images) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows.map((o) => ({ ...o, total_amount: parseFloat(o.total_amount) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
