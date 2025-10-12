const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const crypto = require('crypto');

const router = express.Router();

// 会员套餐配置
const MEMBERSHIP_PLANS = {
  premium: {
    name: '高级会员',
    price: 99, // USDT
    duration: 30, // 天
    features: ['基础计算', '浮盈加仓', '复利计算', '历史记录', '数据导出']
  },
  vip: {
    name: 'VIP会员',
    price: 299, // USDT
    duration: 90, // 天
    features: ['所有高级功能', '优先客服', '定制化服务', 'API访问']
  }
};

// 创建支付订单
router.post('/create-order', auth, [
  body('plan').isIn(['premium', 'vip']).withMessage('套餐类型无效'),
  body('paymentMethod').isIn(['usdt', 'alipay']).withMessage('支付方式无效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, paymentMethod } = req.body;
    const user = req.user;

    // 检查用户是否已有有效会员
    if (user.isMembershipActive()) {
      return res.status(400).json({ 
        message: '您已有有效会员，请等待到期后再续费' 
      });
    }

    const membershipPlan = MEMBERSHIP_PLANS[plan];
    const orderId = crypto.randomUUID();
    const orderData = {
      orderId,
      userId: user.id,
      plan,
      amount: membershipPlan.price,
      currency: 'USDT',
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟过期
    };

    // 这里应该保存订单到数据库，简化处理
    // const order = new Order(orderData);
    // await order.save();

    // 根据支付方式生成支付信息
    let paymentInfo = {};
    if (paymentMethod === 'usdt') {
      paymentInfo = {
        type: 'usdt',
        address: 'TYourUSDTAddressHere', // 实际应该是动态生成的
        amount: membershipPlan.price,
        orderId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}`
      };
    } else if (paymentMethod === 'alipay') {
      // 这里应该集成支付宝SDK
      paymentInfo = {
        type: 'alipay',
        orderId,
        amount: membershipPlan.price,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}`,
        paymentUrl: `https://openapi.alipay.com/gateway.do?orderId=${orderId}`
      };
    }

    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        orderId,
        plan: membershipPlan,
        paymentInfo,
        expiresAt: orderData.expiresAt
      }
    });
  } catch (error) {
    console.error('创建支付订单错误:', error);
    res.status(500).json({ 
      message: '创建订单失败',
      error: error.message 
    });
  }
});

// 验证支付状态
router.post('/verify-payment', auth, [
  body('orderId').exists().withMessage('订单ID不能为空'),
  body('txHash').optional().isString().withMessage('交易哈希必须是字符串')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, txHash } = req.body;

    // 这里应该验证实际的支付状态
    // 简化处理，模拟支付成功
    const isPaymentSuccess = true; // 实际应该调用支付接口验证

    if (!isPaymentSuccess) {
      return res.status(400).json({ message: '支付验证失败' });
    }

    // 更新用户会员状态
    const user = await User.findById(req.user.id);
    const plan = user.membership.type === 'free' ? 'premium' : 'vip'; // 简化逻辑
    const membershipPlan = MEMBERSHIP_PLANS[plan];
    
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + membershipPlan.duration * 24 * 60 * 60 * 1000);

    user.membership = {
      type: plan,
      startDate,
      endDate,
      isActive: true
    };

    await user.save();

    res.json({
      success: true,
      message: '支付验证成功，会员已激活',
      data: {
        membership: user.membership,
        plan: membershipPlan
      }
    });
  } catch (error) {
    console.error('验证支付错误:', error);
    res.status(500).json({ 
      message: '验证支付失败',
      error: error.message 
    });
  }
});

// 获取会员套餐信息
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => ({
      id: key,
      ...plan
    }))
  });
});

// 获取用户支付历史
router.get('/history', auth, async (req, res) => {
  try {
    // 这里应该从订单表查询
    // 简化处理，返回模拟数据
    const paymentHistory = [
      {
        id: '1',
        plan: 'premium',
        amount: 99,
        currency: 'USDT',
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: paymentHistory
    });
  } catch (error) {
    console.error('获取支付历史错误:', error);
    res.status(500).json({ 
      message: '获取支付历史失败',
      error: error.message 
    });
  }
});

// 取消订单
router.post('/cancel-order', auth, [
  body('orderId').exists().withMessage('订单ID不能为空')
], async (req, res) => {
  try {
    const { orderId } = req.body;

    // 这里应该更新订单状态为已取消
    // 简化处理

    res.json({
      success: true,
      message: '订单已取消'
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({ 
      message: '取消订单失败',
      error: error.message 
    });
  }
});

module.exports = router;