import express from 'express';
import db from '../database';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get statistics
router.get('/stats', (req: AuthRequest, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const premiumUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE isPremium = 1').get() as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const revenue = db.prepare('SELECT SUM(amount) as total FROM orders WHERE status = "completed"').get() as any;

    res.json({
      totalUsers: totalUsers.count,
      premiumUsers: premiumUsers.count,
      totalOrders: totalOrders.count,
      revenue: revenue.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
});

// Get all users
router.get('/users', (req: AuthRequest, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, isPremium, premiumExpireDate, isAdmin, createdAt
      FROM users
      ORDER BY createdAt DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// Get all orders
router.get('/orders', (req: AuthRequest, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY createdAt DESC
    `).all();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

// Approve order
router.post('/orders/:orderId/approve', (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: '订单状态不正确' });
    }

    // Update order status
    db.prepare('UPDATE orders SET status = "completed" WHERE id = ?').run(orderId);

    // Update user premium status
    const user = db.prepare('SELECT premiumExpireDate FROM users WHERE id = ?').get(order.userId) as any;
    
    let newExpireDate: Date;
    if (user.premiumExpireDate && new Date(user.premiumExpireDate) > new Date()) {
      // Extend existing premium
      newExpireDate = new Date(user.premiumExpireDate);
    } else {
      // New premium
      newExpireDate = new Date();
    }
    
    newExpireDate.setMonth(newExpireDate.getMonth() + order.duration);

    db.prepare(`
      UPDATE users
      SET isPremium = 1, premiumExpireDate = ?
      WHERE id = ?
    `).run(newExpireDate.toISOString(), order.userId);

    res.json({ message: '订单已批准' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '批准订单失败' });
  }
});

export default router;
