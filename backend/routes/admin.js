import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/analytics', async (_req, res) => {
  try {
    const [revenue, orders, products, users, recentOrders, topProducts] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'`),
      pool.query('SELECT COUNT(*)::int as count FROM orders'),
      pool.query('SELECT COUNT(*)::int as count FROM products'),
      pool.query("SELECT COUNT(*)::int as count FROM users WHERE role = 'user'"),
      pool.query(`
        SELECT o.*, u.name as user_name FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT p.name, SUM(oi.quantity)::int as sold, SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 5
      `),
    ]);

    const monthlyRevenue = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon') as month,
             EXTRACT(MONTH FROM created_at) as month_num,
             SUM(total_amount) as revenue
      FROM orders WHERE status != 'cancelled'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_num ORDER BY month_num
    `);

    res.json({
      revenue: parseFloat(revenue.rows[0].total),
      orderCount: orders.rows[0].count,
      productCount: products.rows[0].count,
      userCount: users.rows[0].count,
      recentOrders: recentOrders.rows.map((o) => ({ ...o, total_amount: parseFloat(o.total_amount) })),
      topProducts: topProducts.rows.map((p) => ({ ...p, revenue: parseFloat(p.revenue) })),
      monthlyRevenue: monthlyRevenue.rows.map((m) => ({ ...m, revenue: parseFloat(m.revenue) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
