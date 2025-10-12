import { Request, Response } from 'express';
import { User } from '../models/User';
import { PaymentOrder } from '../models/PaymentOrder';
import { CalculationHistory } from '../models/CalculationHistory';
import { ApiResponse } from '../types';

// 获取系统统计信息
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // 用户统计
    const totalUsers = await User.countDocuments();
    const vipUsers = await User.countDocuments({ isVip: true });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // 订单统计
    const totalOrders = await PaymentOrder.countDocuments();
    const completedOrders = await PaymentOrder.countDocuments({ status: 'completed' });
    const pendingOrders = await PaymentOrder.countDocuments({ status: 'pending' });
    
    // 收入统计
    const revenueResult = await PaymentOrder.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 计算历史统计
    const totalCalculations = await CalculationHistory.countDocuments();
    const calculationsToday = await CalculationHistory.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          vip: vipUsers,
          newToday: newUsersToday,
          vipRate: totalUsers > 0 ? ((vipUsers / totalUsers) * 100).toFixed(2) : 0
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
        },
        revenue: {
          total: totalRevenue.toFixed(2),
          currency: 'CNY'
        },
        calculations: {
          total: totalCalculations,
          today: calculationsToday
        }
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取系统统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取系统统计失败'
    } as ApiResponse);
  }
};

// 获取用户列表
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, isVip } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (isVip !== undefined) {
      query.isVip = isVip === 'true';
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    } as ApiResponse);
  }
};

// 更新用户VIP状态
export const updateUserVip = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isVip, vipExpiry } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      } as ApiResponse);
    }

    user.isVip = isVip;
    if (vipExpiry) {
      user.vipExpiry = new Date(vipExpiry);
    } else if (!isVip) {
      user.vipExpiry = undefined;
    }

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'VIP状态更新成功'
    } as ApiResponse);

  } catch (error: any) {
    console.error('更新VIP状态错误:', error);
    res.status(500).json({
      success: false,
      error: '更新VIP状态失败'
    } as ApiResponse);
  }
};

// 获取支付订单列表
export const getAllPaymentOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (method) {
      query.method = method;
    }

    const orders = await PaymentOrder.find(query)
      .populate('userId', 'email username')
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

// 手动确认支付订单
export const confirmPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await PaymentOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      } as ApiResponse);
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: '订单状态不允许确认'
      } as ApiResponse);
    }

    // 更新订单状态
    order.status = 'completed';
    order.transactionId = `ADMIN_CONFIRM_${Date.now()}`;
    await order.save();

    // 激活用户VIP
    const user = await User.findById(order.userId);
    if (user) {
      const duration = order.paymentData.duration;
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
    }

    res.json({
      success: true,
      message: '订单确认成功，用户VIP已激活'
    } as ApiResponse);

  } catch (error: any) {
    console.error('确认支付订单错误:', error);
    res.status(500).json({
      success: false,
      error: '确认支付订单失败'
    } as ApiResponse);
  }
};

// 获取计算历史统计
export const getCalculationStats = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // 按日期统计计算次数
    const dailyStats = await CalculationHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          users: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          uniqueUsers: { $size: "$users" }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // 按交易方向统计
    const directionStats = await CalculationHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$input.direction",
          count: { $sum: 1 }
        }
      }
    ]);

    // 热门杠杆倍数
    const leverageStats = await CalculationHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$input.leverage",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        daily: dailyStats,
        direction: directionStats,
        leverage: leverageStats
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取计算统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取计算统计失败'
    } as ApiResponse);
  }
};

// 系统设置
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    // 这里可以实现系统设置的更新逻辑
    // 比如更新费率、限制等配置
    
    res.json({
      success: true,
      message: '系统设置更新成功'
    } as ApiResponse);

  } catch (error: any) {
    console.error('更新系统设置错误:', error);
    res.status(500).json({
      success: false,
      error: '更新系统设置失败'
    } as ApiResponse);
  }
};