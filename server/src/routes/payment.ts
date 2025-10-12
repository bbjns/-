import { Router } from 'express';
import {
  createPaymentOrder,
  confirmUsdtPayment,
  alipayCallback,
  getPaymentOrders,
  getPaymentOrder,
  cancelPaymentOrder,
  getVipPackages
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// 获取VIP套餐信息
router.get('/packages', getVipPackages);

// 创建支付订单
router.post('/orders', 
  authenticate,
  [
    body('packageType').isIn(['monthly', 'yearly', 'lifetime']).withMessage('无效的套餐类型'),
    body('method').isIn(['usdt', 'alipay']).withMessage('无效的支付方式'),
    handleValidationErrors
  ],
  createPaymentOrder
);

// 确认USDT支付
router.post('/confirm-usdt',
  authenticate,
  [
    body('orderId').isMongoId().withMessage('无效的订单ID'),
    body('transactionHash').notEmpty().withMessage('交易哈希不能为空'),
    handleValidationErrors
  ],
  confirmUsdtPayment
);

// 支付宝回调
router.post('/alipay/callback', alipayCallback);

// 获取支付订单列表
router.get('/orders', authenticate, getPaymentOrders);

// 获取订单详情
router.get('/orders/:orderId', authenticate, getPaymentOrder);

// 取消订单
router.put('/orders/:orderId/cancel', authenticate, cancelPaymentOrder);

export default router;