// 高精度计算工具类
export class Calculator {
  // 格式化数字到6位小数
  static formatNumber(num: number): number {
    return Math.round(num * 1000000) / 1000000;
  }

  // 基础计算结果接口
  static calculateBasic(params: {
    accountBalance: number;
    leverage: number;
    isLong: boolean;
    entryPrice: number;
    riskRatio: number;
    feeRate: number;
    stopLoss?: number;
    riskRewardRatio?: number;
  }) {
    const {
      accountBalance,
      leverage,
      isLong,
      entryPrice,
      riskRatio,
      feeRate,
      stopLoss,
      riskRewardRatio
    } = params;

    // 计算风险金额
    const riskAmount = accountBalance * (riskRatio / 100);

    // 计算止损价
    let calculatedStopLoss: number;
    if (stopLoss !== undefined) {
      calculatedStopLoss = stopLoss;
    } else if (riskRewardRatio !== undefined) {
      // 根据盈亏比计算止损价
      const stopLossDistance = (riskAmount / leverage) / accountBalance;
      calculatedStopLoss = isLong
        ? entryPrice * (1 - stopLossDistance)
        : entryPrice * (1 + stopLossDistance);
    } else {
      throw new Error('必须提供止损价或盈亏比');
    }

    // 计算每单位价格变动的损失
    const priceDistance = Math.abs(entryPrice - calculatedStopLoss);
    
    // 计算开仓数量（以基础货币计）
    const positionSize = (riskAmount * leverage) / priceDistance;
    
    // 计算名义仓位价值
    const notionalValue = positionSize * entryPrice;
    
    // 计算实际使用保证金
    const usedMargin = notionalValue / leverage;
    
    // 计算手续费
    const fees = notionalValue * (feeRate / 100) * 2; // 开仓+平仓
    
    // 计算止盈价
    let takeProfitPrice: number;
    if (riskRewardRatio !== undefined) {
      const profitDistance = priceDistance * riskRewardRatio;
      takeProfitPrice = isLong
        ? entryPrice + profitDistance
        : entryPrice - profitDistance;
    } else {
      // 默认1:2的盈亏比
      const profitDistance = priceDistance * 2;
      takeProfitPrice = isLong
        ? entryPrice + profitDistance
        : entryPrice - profitDistance;
    }
    
    // 计算平仓盈亏（到止盈价）
    const profitLoss = isLong
      ? (takeProfitPrice - entryPrice) * positionSize - fees
      : (entryPrice - takeProfitPrice) * positionSize - fees;

    return {
      stopLossPrice: this.formatNumber(calculatedStopLoss),
      takeProfitPrice: this.formatNumber(takeProfitPrice),
      usedMargin: this.formatNumber(usedMargin),
      fees: this.formatNumber(fees),
      profitLoss: this.formatNumber(profitLoss),
      riskPercentage: this.formatNumber(riskRatio),
      notionalValue: this.formatNumber(notionalValue),
      positionSize: this.formatNumber(positionSize)
    };
  }

  // 浮盈加仓计算
  static calculateFloatingProfit(params: {
    accountBalance: number;
    leverage: number;
    isLong: boolean;
    entryPrice: number;
    profitThreshold: number;
    additionRatio: number;
    basicResult: any;
  }) {
    const {
      accountBalance,
      leverage,
      isLong,
      entryPrice,
      profitThreshold,
      additionRatio,
      basicResult
    } = params;

    // 计算加仓触发价
    const profitTriggerAmount = accountBalance * (profitThreshold / 100);
    const { positionSize } = basicResult;
    
    const additionTriggerPrice = isLong
      ? entryPrice + (profitTriggerAmount / positionSize)
      : entryPrice - (profitTriggerAmount / positionSize);

    // 计算加仓金额
    const additionAmount = accountBalance * (additionRatio / 100);
    const additionNotionalValue = additionAmount * leverage;
    const additionMargin = additionAmount;
    
    // 计算加仓后的仓位
    const additionPositionSize = additionNotionalValue / additionTriggerPrice;
    const totalPositionSize = positionSize + additionPositionSize;
    
    // 计算新的平均成本价
    const totalCost = (positionSize * entryPrice) + (additionPositionSize * additionTriggerPrice);
    const newCostPrice = totalCost / totalPositionSize;
    
    // 计算加仓后的止损止盈价（保持相同的风险回报比）
    const originalDistance = Math.abs(entryPrice - basicResult.stopLossPrice);
    const newStopLoss = isLong
      ? newCostPrice - originalDistance
      : newCostPrice + originalDistance;
    
    const newTakeProfit = isLong
      ? newCostPrice + (originalDistance * 2)
      : newCostPrice - (originalDistance * 2);
    
    // 计算总仓位价值
    const totalPositionValue = totalPositionSize * additionTriggerPrice;
    
    // 计算新的风险占比
    const totalMargin = basicResult.usedMargin + additionMargin;
    const riskPercentage = (totalMargin / accountBalance) * 100;

    return {
      additionTriggerPrice: this.formatNumber(additionTriggerPrice),
      newCostPrice: this.formatNumber(newCostPrice),
      additionNotionalValue: this.formatNumber(additionNotionalValue),
      additionMargin: this.formatNumber(additionMargin),
      newStopLoss: this.formatNumber(newStopLoss),
      newTakeProfit: this.formatNumber(newTakeProfit),
      riskPercentage: this.formatNumber(riskPercentage),
      totalPositionValue: this.formatNumber(totalPositionValue)
    };
  }

  // 复利计算
  static calculateCompound(params: {
    initialCapital: number;
    profitRate: number;
    rounds: number;
  }) {
    const { initialCapital, profitRate, rounds } = params;
    const results = [];
    
    let capital = initialCapital;
    for (let i = 1; i <= rounds; i++) {
      capital = capital * (1 + profitRate / 100);
      results.push({
        round: i,
        totalCapital: this.formatNumber(capital)
      });
    }
    
    return results;
  }
}
