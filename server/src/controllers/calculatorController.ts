import { Request, Response } from 'express';
import Decimal from 'decimal.js';
import { CalculationHistory } from '../models/CalculationHistory';
import { ApiResponse } from '../types';
import crypto from 'crypto';

// 配置Decimal.js精度
Decimal.config({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

interface CalculatorInput {
  totalFunds: string;
  leverage: string;
  direction: 'long' | 'short';
  entryPrice: string;
  riskRatio: string;
  feeRate: string;
  stopLoss?: string;
  profitLossRatio?: string;
  profitAddEnabled: boolean;
  profitThreshold?: string;
  addPositionRatio?: string;
}

interface BasicCalculationResult {
  stopLossPrice: string;
  takeProfitPrice: string;
  positionMargin: string;
  tradingFee: string;
  profitLoss: string;
  riskAmount: string;
  notionalValue: string;
  positionSize: string;
}

interface AddPositionResult {
  triggerPrice: string;
  newAvgPrice: string;
  addNotionalValue: string;
  addMargin: string;
  newStopLoss: string;
  newTakeProfit: string;
  newRiskRatio: string;
  totalNotionalValue: string;
  totalPositionSize: string;
}

interface CompoundResult {
  round: number;
  totalFunds: string;
  profit: string;
  cumulativeProfit: string;
}

interface CalculationResult {
  basic: BasicCalculationResult;
  addPosition?: AddPositionResult;
  compound: CompoundResult[];
  isValid: boolean;
  errors: string[];
}

class SpeculationCalculator {
  private input: CalculatorInput;

  constructor(input: CalculatorInput) {
    this.input = input;
  }

  calculate(): CalculationResult {
    const errors: string[] = [];
    
    try {
      // 验证输入参数
      const validationErrors = this.validateInput();
      if (validationErrors.length > 0) {
        return {
          basic: {} as BasicCalculationResult,
          compound: [],
          isValid: false,
          errors: validationErrors,
        };
      }

      // 基础计算
      const basic = this.calculateBasic();
      
      // 浮盈加仓计算
      let addPosition: AddPositionResult | undefined;
      if (this.input.profitAddEnabled && this.input.profitThreshold && this.input.addPositionRatio) {
        addPosition = this.calculateAddPosition(basic);
      }
      
      // 复利计算
      const compound = this.calculateCompound(basic);

      return {
        basic,
        addPosition,
        compound,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '计算过程中发生未知错误');
      return {
        basic: {} as BasicCalculationResult,
        compound: [],
        isValid: false,
        errors,
      };
    }
  }

  private validateInput(): string[] {
    const errors: string[] = [];
    
    const totalFunds = new Decimal(this.input.totalFunds);
    const leverage = new Decimal(this.input.leverage);
    const entryPrice = new Decimal(this.input.entryPrice);
    const riskRatio = new Decimal(this.input.riskRatio);
    const feeRate = new Decimal(this.input.feeRate);
    
    if (totalFunds.lte(0)) {
      errors.push('账户总资金必须大于0');
    }
    
    if (leverage.lte(0) || leverage.gt(1000)) {
      errors.push('杠杆倍数必须在1-1000之间');
    }
    
    if (entryPrice.lte(0)) {
      errors.push('开仓价格必须大于0');
    }
    
    if (riskRatio.lt(0) || riskRatio.gt(100)) {
      errors.push('风险占比必须在0-100之间');
    }
    
    if (feeRate.lt(0) || feeRate.gt(10)) {
      errors.push('手续费率必须在0-10%之间');
    }
    
    // 验证止损价或盈亏比
    if (!this.input.stopLoss && !this.input.profitLossRatio) {
      errors.push('必须设置止损价格或盈亏比');
    }
    
    if (this.input.stopLoss && this.input.profitLossRatio) {
      errors.push('止损价格和盈亏比只能设置其中一个');
    }
    
    if (this.input.stopLoss) {
      const stopLoss = new Decimal(this.input.stopLoss);
      if (this.input.direction === 'long' && stopLoss.gte(entryPrice)) {
        errors.push('做多时止损价必须小于开仓价');
      }
      if (this.input.direction === 'short' && stopLoss.lte(entryPrice)) {
        errors.push('做空时止损价必须大于开仓价');
      }
    }
    
    if (this.input.profitLossRatio) {
      const profitLossRatio = new Decimal(this.input.profitLossRatio);
      if (profitLossRatio.lte(0)) {
        errors.push('盈亏比必须大于0');
      }
    }
    
    return errors;
  }

  private calculateBasic(): BasicCalculationResult {
    const totalFunds = new Decimal(this.input.totalFunds);
    const leverage = new Decimal(this.input.leverage);
    const entryPrice = new Decimal(this.input.entryPrice);
    const riskRatio = new Decimal(this.input.riskRatio);
    const feeRate = new Decimal(this.input.feeRate);
    
    // 计算风险金额
    const riskAmount = totalFunds.mul(riskRatio).div(100);
    
    // 计算止损价和止盈价
    let stopLossPrice: Decimal;
    let takeProfitPrice: Decimal;
    
    if (this.input.stopLoss) {
      stopLossPrice = new Decimal(this.input.stopLoss);
      // 根据止损价计算盈亏比对应的止盈价
      const lossPerUnit = entryPrice.sub(stopLossPrice).abs();
      const profitPerUnit = lossPerUnit; // 默认1:1
      
      if (this.input.direction === 'long') {
        takeProfitPrice = entryPrice.add(profitPerUnit);
      } else {
        takeProfitPrice = entryPrice.sub(profitPerUnit);
      }
    } else {
      // 使用盈亏比计算
      const profitLossRatio = new Decimal(this.input.profitLossRatio!);
      
      // 根据风险金额和杠杆计算可承受的价格变动
      const positionValue = riskAmount.mul(leverage);
      const positionSize = positionValue.div(entryPrice);
      const maxLossPerUnit = riskAmount.div(positionSize);
      
      if (this.input.direction === 'long') {
        stopLossPrice = entryPrice.sub(maxLossPerUnit);
        takeProfitPrice = entryPrice.add(maxLossPerUnit.mul(profitLossRatio));
      } else {
        stopLossPrice = entryPrice.add(maxLossPerUnit);
        takeProfitPrice = entryPrice.sub(maxLossPerUnit.mul(profitLossRatio));
      }
    }
    
    // 计算仓位大小和保证金
    const positionValue = riskAmount.mul(leverage);
    const positionSize = positionValue.div(entryPrice);
    const positionMargin = positionValue.div(leverage);
    
    // 计算手续费
    const tradingFee = positionValue.mul(feeRate).div(100).mul(2); // 开仓+平仓
    
    // 计算平仓盈亏
    const priceChange = takeProfitPrice.sub(entryPrice);
    const profitLoss = this.input.direction === 'long' 
      ? positionSize.mul(priceChange)
      : positionSize.mul(priceChange.neg());
    
    // 名义仓位价值
    const notionalValue = positionSize.mul(entryPrice);
    
    return {
      stopLossPrice: this.roundToSixDecimals(stopLossPrice),
      takeProfitPrice: this.roundToSixDecimals(takeProfitPrice),
      positionMargin: this.roundToSixDecimals(positionMargin),
      tradingFee: this.roundToSixDecimals(tradingFee),
      profitLoss: this.roundToSixDecimals(profitLoss),
      riskAmount: this.roundToSixDecimals(riskAmount),
      notionalValue: this.roundToSixDecimals(notionalValue),
      positionSize: this.roundToSixDecimals(positionSize),
    };
  }

  private calculateAddPosition(basic: BasicCalculationResult): AddPositionResult {
    const totalFunds = new Decimal(this.input.totalFunds);
    const leverage = new Decimal(this.input.leverage);
    const entryPrice = new Decimal(this.input.entryPrice);
    const profitThreshold = new Decimal(this.input.profitThreshold!);
    const addPositionRatio = new Decimal(this.input.addPositionRatio!);
    
    // 计算加仓触发价
    const profitPercent = profitThreshold.div(100);
    const priceChange = entryPrice.mul(profitPercent);
    const triggerPrice = this.input.direction === 'long' 
      ? entryPrice.add(priceChange)
      : entryPrice.sub(priceChange);
    
    // 计算加仓金额
    const addAmount = totalFunds.mul(addPositionRatio).div(100);
    const addNotionalValue = addAmount.mul(leverage);
    const addPositionSize = addNotionalValue.div(triggerPrice);
    const addMargin = addNotionalValue.div(leverage);
    
    // 计算加仓后的平均成本价
    const originalPositionSize = new Decimal(basic.positionSize);
    const totalPositionSize = originalPositionSize.add(addPositionSize);
    const totalCost = originalPositionSize.mul(entryPrice).add(addPositionSize.mul(triggerPrice));
    const newAvgPrice = totalCost.div(totalPositionSize);
    
    // 计算新的止损止盈价
    const originalLoss = originalPositionSize.mul(entryPrice.sub(new Decimal(basic.stopLossPrice)).abs());
    const newLossPerUnit = originalLoss.div(totalPositionSize);
    
    let newStopLoss: Decimal;
    let newTakeProfit: Decimal;
    
    if (this.input.direction === 'long') {
      newStopLoss = newAvgPrice.sub(newLossPerUnit);
      const profitPerUnit = new Decimal(basic.takeProfitPrice).sub(entryPrice);
      newTakeProfit = newAvgPrice.add(profitPerUnit);
    } else {
      newStopLoss = newAvgPrice.add(newLossPerUnit);
      const profitPerUnit = entryPrice.sub(new Decimal(basic.takeProfitPrice));
      newTakeProfit = newAvgPrice.sub(profitPerUnit);
    }
    
    // 计算新的风险占比
    const totalMargin = new Decimal(basic.positionMargin).add(addMargin);
    const newRiskRatio = totalMargin.div(totalFunds).mul(100);
    
    // 计算总仓位价值
    const totalNotionalValue = totalPositionSize.mul(triggerPrice);
    
    return {
      triggerPrice: this.roundToSixDecimals(triggerPrice),
      newAvgPrice: this.roundToSixDecimals(newAvgPrice),
      addNotionalValue: this.roundToSixDecimals(addNotionalValue),
      addMargin: this.roundToSixDecimals(addMargin),
      newStopLoss: this.roundToSixDecimals(newStopLoss),
      newTakeProfit: this.roundToSixDecimals(newTakeProfit),
      newRiskRatio: this.roundToSixDecimals(newRiskRatio),
      totalNotionalValue: this.roundToSixDecimals(totalNotionalValue),
      totalPositionSize: this.roundToSixDecimals(totalPositionSize),
    };
  }

  private calculateCompound(basic: BasicCalculationResult, rounds: number = 10): CompoundResult[] {
    const results: CompoundResult[] = [];
    let currentFunds = new Decimal(this.input.totalFunds);
    let cumulativeProfit = new Decimal(0);
    const riskRatio = new Decimal(this.input.riskRatio);
    const profitLoss = new Decimal(basic.profitLoss);
    const riskAmount = new Decimal(basic.riskAmount);
    
    for (let i = 1; i <= rounds; i++) {
      // 每轮使用相同的风险占比和盈亏比进行计算
      const roundRiskAmount = currentFunds.mul(riskRatio).div(100);
      const roundProfit = profitLoss.mul(roundRiskAmount).div(riskAmount);
      
      currentFunds = currentFunds.add(roundProfit);
      cumulativeProfit = cumulativeProfit.add(roundProfit);
      
      results.push({
        round: i,
        totalFunds: this.roundToSixDecimals(currentFunds),
        profit: this.roundToSixDecimals(roundProfit),
        cumulativeProfit: this.roundToSixDecimals(cumulativeProfit),
      });
    }
    
    return results;
  }

  private roundToSixDecimals(value: Decimal): string {
    return value.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
  }
}

// 计算接口
export const calculate = async (req: Request, res: Response) => {
  try {
    const input: CalculatorInput = req.body;
    
    // 检查非VIP用户限制
    if (!req.user?.isVip) {
      const totalFunds = new Decimal(input.totalFunds);
      if (totalFunds.gt(100000)) {
        return res.status(403).json({
          success: false,
          error: '非VIP用户总资金限制为10万，请升级VIP解除限制'
        } as ApiResponse);
      }
    }

    const calculator = new SpeculationCalculator(input);
    const result = calculator.calculate();

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        error: '计算参数验证失败',
        data: result.errors
      } as ApiResponse);
    }

    // 保存计算历史
    try {
      const sessionId = req.headers['x-session-id'] as string || crypto.randomBytes(16).toString('hex');
      
      const history = new CalculationHistory({
        userId: req.user?._id,
        sessionId,
        input,
        result
      });
      
      await history.save();
    } catch (historyError) {
      console.error('保存计算历史失败:', historyError);
      // 不影响主要功能，继续返回结果
    }

    res.json({
      success: true,
      data: result,
      message: '计算完成'
    } as ApiResponse);

  } catch (error: any) {
    console.error('计算错误:', error);
    res.status(500).json({
      success: false,
      error: '计算失败，请稍后重试'
    } as ApiResponse);
  }
};

// 获取计算历史
export const getCalculationHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    
    const query = userId ? { userId } : {};
    
    const history = await CalculationHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await CalculationHistory.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取计算历史错误:', error);
    res.status(500).json({
      success: false,
      error: '获取计算历史失败'
    } as ApiResponse);
  }
};