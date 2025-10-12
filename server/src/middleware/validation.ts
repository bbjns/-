import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../types';

// 验证结果处理中间件
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: '输入数据验证失败',
      data: errors.array()
    } as ApiResponse);
  }
  next();
};

// 用户注册验证规则
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文字符'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少需要6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  handleValidationErrors
];

// 用户登录验证规则
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  handleValidationErrors
];

// 计算器输入验证规则
export const validateCalculatorInput = [
  body('totalFunds')
    .isNumeric()
    .withMessage('账户总资金必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('账户总资金必须大于0');
      if (num > 1000000000) throw new Error('账户总资金不能超过10亿');
      return true;
    }),
  body('leverage')
    .isNumeric()
    .withMessage('杠杆倍数必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num <= 0 || num > 1000) throw new Error('杠杆倍数必须在1-1000之间');
      return true;
    }),
  body('direction')
    .isIn(['long', 'short'])
    .withMessage('交易方向必须是long或short'),
  body('entryPrice')
    .isNumeric()
    .withMessage('开仓价格必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('开仓价格必须大于0');
      return true;
    }),
  body('riskRatio')
    .isNumeric()
    .withMessage('风险占比必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0 || num > 100) throw new Error('风险占比必须在0-100之间');
      return true;
    }),
  body('feeRate')
    .isNumeric()
    .withMessage('手续费率必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0 || num > 10) throw new Error('手续费率必须在0-10%之间');
      return true;
    }),
  body('stopLoss')
    .optional()
    .isNumeric()
    .withMessage('止损价格必须是数字'),
  body('profitLossRatio')
    .optional()
    .isNumeric()
    .withMessage('盈亏比必须是数字')
    .custom((value) => {
      if (value !== undefined) {
        const num = parseFloat(value);
        if (num <= 0) throw new Error('盈亏比必须大于0');
      }
      return true;
    }),
  body('profitAddEnabled')
    .isBoolean()
    .withMessage('浮盈加仓标志必须是布尔值'),
  body('profitThreshold')
    .optional()
    .isNumeric()
    .withMessage('盈利阈值必须是数字'),
  body('addPositionRatio')
    .optional()
    .isNumeric()
    .withMessage('加仓比例必须是数字'),
  handleValidationErrors
];

// 支付订单验证规则
export const validatePaymentOrder = [
  body('amount')
    .isNumeric()
    .withMessage('支付金额必须是数字')
    .custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('支付金额必须大于0');
      if (num > 100000) throw new Error('单次支付金额不能超过10万');
      return true;
    }),
  body('method')
    .isIn(['usdt', 'alipay'])
    .withMessage('支付方式必须是usdt或alipay'),
  handleValidationErrors
];

// 密码重置验证规则
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  handleValidationErrors
];

// 新密码验证规则
export const validateNewPassword = [
  body('token')
    .notEmpty()
    .withMessage('重置令牌不能为空'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少需要6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  handleValidationErrors
];