import { Request, Response } from 'express';
import Decimal from 'decimal.js';
import crypto from 'crypto';
import { PaymentOrder } from '../models/PaymentOrder';
import { User } from '../models/User';
import { ApiResponse } from '../types';
import { config } from '../config/config';

// VIP套餐配置
const VIP_PACKAGES = {
  monthly: {
    name: '月度会员',
    price: new Decimal(29.99),
    duration: 30, // 天数
    description: '30天VIP权限'
  },
  yearly: {
    name: '年度会员',
    price: new Decimal(299.99),
    duration: 365,
    description: '365天VIP权限，享受8.3折优惠'
  },
  lifetime: {
    name: '终身会员',
    price: new Decimal(999.99),
    duration: -1, // -1表示永久
    description: '永久VIP权限，一次购买终身享受'
  }
};

// 创建支付订单
export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { packageType, method } = req.body;
    const userId = req.user!._id;

    // 验证套餐类型
    if (!VIP_PACKAGES[packageType as keyof typeof VIP_PACKAGES]) {
      return res.status(400).json({
        success: false,
        error: '无效的套餐类型'
      } as ApiResponse);
    }

    const packageInfo = VIP_PACKAGES[packageType as keyof typeof VIP_PACKAGES];
    
    // 创建订单
    const order = new PaymentOrder({
      userId,
      amount: packageInfo.price,
      method,
      status: 'pending',
      paymentData: {
        packageType,
        packageName: packageInfo.name,
        duration: packageInfo.duration,
        description: packageInfo.description
      }
    });

    await order.save();

    // 根据支付方式生成支付信息
    let paymentInfo: any = {};

    if (method === 'usdt') {
      paymentInfo = {
        walletAddress: config.USDT_WALLET_ADDRESS,
        amount: packageInfo.price.toString(),
        network: 'TRC20',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${config.USDT_WALLET_ADDRESS}`,
        instructions: [
          '1. 复制钱包地址或扫描二维码',
          '2. 使用USDT-TRC20网络转账',
          `3. 转账金额：${packageInfo.price.toString()} USDT`,
          '4. 转账完成后，请保存交易哈希',
          '5. 联系客服确认到账'
        ]
      };
    } else if (method === 'alipay') {
      // 支付宝支付（这里简化处理，实际需要接入支付宝SDK）
      paymentInfo = {
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=alipay://pay?amount=${packageInfo.price.toString()}`,
        amount: packageInfo.price.toString(),
        instructions: [
          '1. 打开支付宝扫一扫',
          '2. 扫描上方二维码',
          `3. 确认支付金额：¥${packageInfo.price.toString()}`,
          '4. 完成支付',
          '5. 系统将自动确认到账'
        ]
      };
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        packageInfo,
        paymentInfo,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
      },
      message: '支付订单创建成功'
    } as ApiResponse);

  } catch (error: any) {
    console.error('创建支付订单错误:', error);
    res.status(500).json({
      success: false,
      error: '创建支付订单失败'
    } as ApiResponse);
  }
};

// 确认支付（USDT）
export const confirmUsdtPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, transactionHash } = req.body;
    const userId = req.user!._id;

    // 查找订单
    const order = await PaymentOrder.findOne({
      _id: orderId,
      userId,
      status: 'pending',
      method: 'usdt'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在或已处理'
      } as ApiResponse);
    }

    // 检查订单是否过期（30分钟）
    const orderAge = Date.now() - order.createdAt.getTime();
    if (orderAge > 30 * 60 * 1000) {
      order.status = 'cancelled';
      await order.save();
      
      return res.status(400).json({
        success: false,
        error: '订单已过期，请重新创建'
      } as ApiResponse);
    }

    // 更新订单状态（实际项目中需要验证区块链交易）
    order.transactionId = transactionHash;
    order.status = 'completed'; // 这里简化处理，实际需要异步验证
    await order.save();

    // 激活VIP
    await activateVip(userId, order.paymentData.duration);

    res.json({
      success: true,
      message: 'USDT支付确认成功，VIP已激活'
    } as ApiResponse);

  } catch (error: any) {
    console.error('确认USDT支付错误:', error);
    res.status(500).json({
      success: false,
      error: '确认支付失败'
    } as ApiResponse);
  }
};

// 支付宝支付回调（模拟）
export const alipayCallback = async (req: Request, res: Response) => {
  try {
    // 这里是支付宝回调处理逻辑
    // 实际项目中需要验证支付宝签名
    const { out_trade_no, trade_status, total_amount } = req.body;

    if (trade_status === 'TRADE_SUCCESS') {
      const order = await PaymentOrder.findOne({
        _id: out_trade_no,
        status: 'pending',
        method: 'alipay'
      });

      if (order && order.amount.equals(new Decimal(total_amount))) {
        order.status = 'completed';
        order.transactionId = req.body.trade_no;
        await order.save();

        // 激活VIP
        await activateVip(order.userId, order.paymentData.duration);
      }
    }

    res.send('success');
  } catch (error: any) {
    console.error('支付宝回调错误:', error);
    res.send('fail');
  }
};

// 激活VIP
const activateVip = async (userId: string, duration: number) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (duration === -1) {
    // 终身会员
    user.isVip = true;
    user.vipExpiry = undefined;
  } else {
    // 有期限会员
    const now = new Date();
    const currentExpiry = user.vipExpiry && user.vipExpiry > now ? user.vipExpiry : now;
    
    user.isVip = true;
    user.vipExpiry = new Date(currentExpiry.getTime() + duration * 24 * 60 * 60 * 1000);
  }

  await user.save();
};

// 获取支付订单列表
export const getPaymentOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await PaymentOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await PaymentOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取支付订单错误:', error);
    res.status(500).json({
      success: false,
      error: '获取支付订单失败'
    } as ApiResponse);
  }
};

// 获取订单详情
export const getPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!._id;

    const order = await PaymentOrder.findOne({
      _id: orderId,
      userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: order
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取订单详情失败'
    } as ApiResponse);
  }
};

// 取消订单
export const cancelPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!._id;

    const order = await PaymentOrder.findOne({
      _id: orderId,
      userId,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在或无法取消'
      } as ApiResponse);
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: '订单已取消'
    } as ApiResponse);

  } catch (error: any) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      error: '取消订单失败'
    } as ApiResponse);
  }
};

// 获取VIP套餐信息
export const getVipPackages = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: VIP_PACKAGES
    } as ApiResponse);
  } catch (error: any) {
    console.error('获取VIP套餐错误:', error);
    res.status(500).json({
      success: false,
      error: '获取VIP套餐失败'
    } as ApiResponse);
  }
};