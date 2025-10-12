import Decimal from 'decimal.js';

// 主题类型
export type Theme = 'classic' | 'dark' | 'gold';

// 语言类型
export type Language = 'zh' | 'ko' | 'en';

// 交易方向
export type TradeDirection = 'long' | 'short';

// 用户类型
export interface User {
  id: string;
  email: string;
  username: string;
  isVip: boolean;
  vipExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 计算器输入参数
export interface CalculatorInput {
  totalFunds: Decimal;           // 账户总资金
  leverage: Decimal;             // 杠杆
  direction: TradeDirection;     // 做多/做空
  entryPrice: Decimal;          // 开仓价
  riskRatio: Decimal;           // 风险占比 (0-100)
  feeRate: Decimal;             // 手续费率
  
  // 浮盈加仓参数
  profitAddEnabled: boolean;     // 是否启用浮盈加仓
  profitThreshold?: Decimal;     // 盈利阈值百分比
  addPositionRatio?: Decimal;    // 加仓比例
  
  // 止损止盈设置 (二选一)
  stopLoss?: Decimal;           // 止损价
  profitLossRatio?: Decimal;    // 盈亏比 (如 2 表示 1:2)
}

// 基础计算结果
export interface BasicCalculationResult {
  stopLossPrice: Decimal;       // 止损价
  takeProfitPrice: Decimal;     // 止盈价
  positionMargin: Decimal;      // 开仓占用资金
  tradingFee: Decimal;          // 手续费
  profitLoss: Decimal;          // 平仓盈亏
  riskAmount: Decimal;          // 风险金额
  notionalValue: Decimal;       // 名义仓位价值
  positionSize: Decimal;        // 仓位大小
}

// 浮盈加仓计算结果
export interface AddPositionResult {
  triggerPrice: Decimal;        // 加仓触发价
  newAvgPrice: Decimal;         // 加仓后成本价
  addNotionalValue: Decimal;    // 名义加仓价值
  addMargin: Decimal;           // 加仓保证金
  newStopLoss: Decimal;         // 加仓后止损价
  newTakeProfit: Decimal;       // 加仓后止盈价
  newRiskRatio: Decimal;        // 新风险占比
  totalNotionalValue: Decimal;  // 加仓后总仓位价值
  totalPositionSize: Decimal;   // 加仓后总仓位大小
}

// 复利计算结果
export interface CompoundResult {
  round: number;                // 轮次
  totalFunds: Decimal;          // 该轮后总资金
  profit: Decimal;              // 该轮盈利
  cumulativeProfit: Decimal;    // 累计盈利
}

// 完整计算结果
export interface CalculationResult {
  basic: BasicCalculationResult;
  addPosition?: AddPositionResult;
  compound: CompoundResult[];
  isValid: boolean;
  errors: string[];
}

// 支付方式
export type PaymentMethod = 'usdt' | 'alipay';

// 充值订单
export interface PaymentOrder {
  id: string;
  userId: string;
  amount: Decimal;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 主题配置
export interface ThemeConfig {
  name: Theme;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}