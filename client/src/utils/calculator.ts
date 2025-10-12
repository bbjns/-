import Decimal from 'decimal.js';
import {
  CalculatorInput,
  CalculationResult,
  BasicCalculationResult,
  AddPositionResult,
  CompoundResult,
  TradeDirection,
} from '../types';

// 配置Decimal.js精度
Decimal.config({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

export class SpeculationCalculator {
  private input: CalculatorInput;

  constructor(input: CalculatorInput) {
    this.input = input;
  }

  /**
   * 执行完整计算
   */
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

  /**
   * 验证输入参数
   */
  private validateInput(): string[] {
    const errors: string[] = [];
    
    if (this.input.totalFunds.lte(0)) {
      errors.push('账户总资金必须大于0');
    }
    
    if (this.input.leverage.lte(0) || this.input.leverage.gt(1000)) {
      errors.push('杠杆倍数必须在1-1000之间');
    }
    
    if (this.input.entryPrice.lte(0)) {
      errors.push('开仓价格必须大于0');
    }
    
    if (this.input.riskRatio.lt(0) || this.input.riskRatio.gt(100)) {
      errors.push('风险占比必须在0-100之间');
    }
    
    if (this.input.feeRate.lt(0) || this.input.feeRate.gt(10)) {
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
      if (this.input.direction === 'long' && this.input.stopLoss.gte(this.input.entryPrice)) {
        errors.push('做多时止损价必须小于开仓价');
      }
      if (this.input.direction === 'short' && this.input.stopLoss.lte(this.input.entryPrice)) {
        errors.push('做空时止损价必须大于开仓价');
      }
    }
    
    if (this.input.profitLossRatio && this.input.profitLossRatio.lte(0)) {
      errors.push('盈亏比必须大于0');
    }
    
    // 验证浮盈加仓参数
    if (this.input.profitAddEnabled) {
      if (!this.input.profitThreshold || this.input.profitThreshold.lte(0)) {
        errors.push('盈利阈值必须大于0');
      }
      if (!this.input.addPositionRatio || this.input.addPositionRatio.lte(0) || this.input.addPositionRatio.gt(100)) {
        errors.push('加仓比例必须在0-100之间');
      }
    }
    
    return errors;
  }

  /**
   * 基础计算
   */
  private calculateBasic(): BasicCalculationResult {
    const { totalFunds, leverage, direction, entryPrice, riskRatio, feeRate } = this.input;
    
    // 计算风险金额
    const riskAmount = totalFunds.mul(riskRatio).div(100);
    
    // 计算止损价和止盈价
    let stopLossPrice: Decimal;
    let takeProfitPrice: Decimal;
    
    if (this.input.stopLoss) {
      stopLossPrice = this.input.stopLoss;
      // 根据止损价计算盈亏比对应的止盈价
      const lossPerUnit = entryPrice.sub(stopLossPrice).abs();
      const profitPerUnit = lossPerUnit; // 默认1:1
      
      if (direction === 'long') {
        takeProfitPrice = entryPrice.add(profitPerUnit);
      } else {
        takeProfitPrice = entryPrice.sub(profitPerUnit);
      }
    } else {
      // 使用盈亏比计算
      const profitLossRatio = this.input.profitLossRatio!;
      
      // 根据风险金额和杠杆计算可承受的价格变动
      const positionValue = riskAmount.mul(leverage);
      const positionSize = positionValue.div(entryPrice);
      const maxLossPerUnit = riskAmount.div(positionSize);
      
      if (direction === 'long') {
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
    const profitLoss = direction === 'long' 
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

  /**
   * 浮盈加仓计算
   */
  private calculateAddPosition(basic: BasicCalculationResult): AddPositionResult {
    const { totalFunds, leverage, direction, entryPrice, profitThreshold, addPositionRatio } = this.input;
    
    // 计算加仓触发价
    const profitPercent = profitThreshold!.div(100);
    const priceChange = entryPrice.mul(profitPercent);
    const triggerPrice = direction === 'long' 
      ? entryPrice.add(priceChange)
      : entryPrice.sub(priceChange);
    
    // 计算加仓金额
    const addAmount = totalFunds.mul(addPositionRatio!).div(100);
    const addNotionalValue = addAmount.mul(leverage);
    const addPositionSize = addNotionalValue.div(triggerPrice);
    const addMargin = addNotionalValue.div(leverage);
    
    // 计算加仓后的平均成本价
    const totalPositionSize = basic.positionSize.add(addPositionSize);
    const totalCost = basic.positionSize.mul(entryPrice).add(addPositionSize.mul(triggerPrice));
    const newAvgPrice = totalCost.div(totalPositionSize);
    
    // 计算新的止损止盈价
    const originalLoss = basic.positionSize.mul(entryPrice.sub(basic.stopLossPrice).abs());
    const newLossPerUnit = originalLoss.div(totalPositionSize);
    
    let newStopLoss: Decimal;
    let newTakeProfit: Decimal;
    
    if (direction === 'long') {
      newStopLoss = newAvgPrice.sub(newLossPerUnit);
      const profitPerUnit = basic.takeProfitPrice.sub(entryPrice);
      newTakeProfit = newAvgPrice.add(profitPerUnit);
    } else {
      newStopLoss = newAvgPrice.add(newLossPerUnit);
      const profitPerUnit = entryPrice.sub(basic.takeProfitPrice);
      newTakeProfit = newAvgPrice.sub(profitPerUnit);
    }
    
    // 计算新的风险占比
    const totalMargin = basic.positionMargin.add(addMargin);
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

  /**
   * 复利计算
   */
  private calculateCompound(basic: BasicCalculationResult, rounds: number = 10): CompoundResult[] {
    const results: CompoundResult[] = [];
    let currentFunds = this.input.totalFunds;
    let cumulativeProfit = new Decimal(0);
    
    for (let i = 1; i <= rounds; i++) {
      // 每轮使用相同的风险占比和盈亏比进行计算
      const roundRiskAmount = currentFunds.mul(this.input.riskRatio).div(100);
      const roundProfit = basic.profitLoss.mul(roundRiskAmount).div(basic.riskAmount);
      
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

  /**
   * 保留6位小数
   */
  private roundToSixDecimals(value: Decimal): Decimal {
    return value.toDecimalPlaces(6, Decimal.ROUND_HALF_UP);
  }
}

/**
 * 计算器工厂函数
 */
export function createCalculator(input: CalculatorInput): SpeculationCalculator {
  return new SpeculationCalculator(input);
}

/**
 * 快速计算函数
 */
export function calculate(input: CalculatorInput): CalculationResult {
  const calculator = createCalculator(input);
  return calculator.calculate();
}