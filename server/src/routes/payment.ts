import express from 'express';
import db, { generateId } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create order
router.post('/create-order', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { duration, paymentMethod, amount } = req.body;

    if (!duration || !paymentMethod || !amount) {
      return res.status(400).json({ message: '参数不完整' });
    }

    const orderId = generateId();

    db.prepare(`
      INSERT INTO orders (id, userId, amount, duration, paymentMethod, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(orderId, req.userId, amount, duration, paymentMethod);

    res.json({
      orderId,
      amount,
      duration,
      paymentMethod,
      message: '订单创建成功，请完成支付'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '创建订单失败' });
  }
});

// Get user orders
router.get('/orders', authMiddleware, (req: AuthRequest, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC
    `).all(req.userId);

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取订单失败' });
  }
});

export default router;
