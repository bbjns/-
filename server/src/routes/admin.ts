import { Router } from 'express';
import {
  getSystemStats,
  getUsers,
  updateUserVip,
  getAllPaymentOrders,
  confirmPaymentOrder,
  getCalculationStats,
  updateSystemSettings
} from '../controllers/adminController';
import { authenticate, requireVip } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// 所有管理接口都需要VIP权限
router.use(authenticate, requireVip);

// 系统统计
router.get('/stats', getSystemStats);

// 用户管理
router.get('/users', getUsers);
router.put('/users/:userId/vip', 
  [
    body('isVip').isBoolean().withMessage('isVip必须是布尔值'),
    body('vipExpiry').optional().isISO8601().withMessage('vipExpiry必须是有效日期'),
    handleValidationErrors
  ],
  updateUserVip
);

// 订单管理
router.get('/orders', getAllPaymentOrders);
router.put('/orders/:orderId/confirm', confirmPaymentOrder);

// 计算统计
router.get('/calculations/stats', getCalculationStats);

// 系统设置
router.put('/settings', updateSystemSettings);

export default router;