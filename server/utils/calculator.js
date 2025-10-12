/**
 * 投机计算器核心计算逻辑
 * 所有计算结果精确到小数点后6位
 */

/**
 * 基础交易计算
 * @param {Object} params - 计算参数
 * @returns {Object} 计算结果
 */
function calculateBasicTrading(params) {
  const {
    totalFunds,
    leverage,
    positionType,
    entryPrice,
    riskPercentage,
    feeRate = 0.001,
    stopLossSettings
  } = params;

  // 风险资金 = 总资金 * 风险占比
  const riskFunds = totalFunds * (riskPercentage / 100);
  
  // 计算止损价和止盈价
  let stopLossPrice, takeProfitPrice;
  
  if (stopLossSettings.type === 'price') {
    stopLossPrice = stopLossSettings.stopLossPrice;
    const priceDiff = Math.abs(entryPrice - stopLossPrice);
    const profitLossRatio = stopLossSettings.profitLossRatio || 2;
    
    if (positionType === 'long') {
      takeProfitPrice = entryPrice + (priceDiff * profitLossRatio);
    } else {
      takeProfitPrice = entryPrice - (priceDiff * profitLossRatio);
    }
  } else {
    // 使用盈亏比计算
    const profitLossRatio = stopLossSettings.profitLossRatio;
    const priceDiff = riskFunds / (totalFunds * leverage);
    
    if (positionType === 'long') {
      stopLossPrice = entryPrice - priceDiff;
      takeProfitPrice = entryPrice + (priceDiff * profitLossRatio);
    } else {
      stopLossPrice = entryPrice + priceDiff;
      takeProfitPrice = entryPrice - (priceDiff * profitLossRatio);
    }
  }

  // 计算仓位大小
  const priceDiff = Math.abs(entryPrice - stopLossPrice);
  const positionSize = riskFunds / priceDiff;
  
  // 名义仓位价值
  const nominalPositionValue = positionSize * entryPrice;
  
  // 所需保证金
  const marginRequired = nominalPositionValue / leverage;
  
  // 手续费
  const fees = nominalPositionValue * feeRate * 2; // 开仓和平仓
  
  // 平仓盈亏
  let profitLoss;
  if (positionType === 'long') {
    profitLoss = positionSize * (takeProfitPrice - entryPrice) - fees;
  } else {
    profitLoss = positionSize * (entryPrice - takeProfitPrice) - fees;
  }

  return {
    stopLossPrice: parseFloat(stopLossPrice.toFixed(6)),
    takeProfitPrice: parseFloat(takeProfitPrice.toFixed(6)),
    positionSize: parseFloat(positionSize.toFixed(6)),
    marginRequired: parseFloat(marginRequired.toFixed(6)),
    fees: parseFloat(fees.toFixed(6)),
    profitLoss: parseFloat(profitLoss.toFixed(6)),
    riskPercentage: parseFloat(riskPercentage.toFixed(6)),
    nominalPositionValue: parseFloat(nominalPositionValue.toFixed(6))
  };
}

/**
 * 浮盈加仓计算
 * @param {Object} params - 计算参数
 * @returns {Object} 计算结果
 */
function calculatePyramidTrading(params) {
  const {
    totalFunds,
    leverage,
    positionType,
    entryPrice,
    riskPercentage,
    feeRate = 0.001,
    stopLossSettings,
    pyramidSettings
  } = params;

  // 先计算基础仓位
  const basicResult = calculateBasicTrading(params);
  
  // 加仓触发价格
  const profitTriggerPercentage = pyramidSettings.profitTriggerPercentage / 100;
  const triggerPrice = positionType === 'long' 
    ? entryPrice * (1 + profitTriggerPercentage)
    : entryPrice * (1 - profitTriggerPercentage);
  
  // 加仓资金 = 总资金 * 加仓百分比
  const pyramidFunds = totalFunds * (pyramidSettings.pyramidPercentage / 100);
  
  // 加仓数量
  const additionalPositionSize = pyramidFunds / triggerPrice;
  
  // 新的平均成本价
  const totalPositionSize = basicResult.positionSize + additionalPositionSize;
  const totalCost = (basicResult.positionSize * entryPrice) + (additionalPositionSize * triggerPrice);
  const newAveragePrice = totalCost / totalPositionSize;
  
  // 加仓后的名义价值
  const additionalPositionValue = additionalPositionSize * triggerPrice;
  const additionalMargin = additionalPositionValue / leverage;
  
  // 重新计算止损止盈价
  const newRiskFunds = totalFunds * (riskPercentage / 100);
  const newPriceDiff = newRiskFunds / (totalFunds * leverage);
  
  let newStopLossPrice, newTakeProfitPrice;
  if (stopLossSettings.type === 'price') {
    newStopLossPrice = stopLossSettings.stopLossPrice;
    const priceDiff = Math.abs(newAveragePrice - newStopLossPrice);
    const profitLossRatio = stopLossSettings.profitLossRatio || 2;
    
    if (positionType === 'long') {
      newTakeProfitPrice = newAveragePrice + (priceDiff * profitLossRatio);
    } else {
      newTakeProfitPrice = newAveragePrice - (priceDiff * profitLossRatio);
    }
  } else {
    const profitLossRatio = stopLossSettings.profitLossRatio;
    
    if (positionType === 'long') {
      newStopLossPrice = newAveragePrice - newPriceDiff;
      newTakeProfitPrice = newAveragePrice + (newPriceDiff * profitLossRatio);
    } else {
      newStopLossPrice = newAveragePrice + newPriceDiff;
      newTakeProfitPrice = newAveragePrice - (newPriceDiff * profitLossRatio);
    }
  }
  
  // 新的风险占比
  const newRiskPercentage = (newPriceDiff / newAveragePrice) * 100;
  
  // 总仓位价值
  const totalPositionValue = totalPositionSize * newAveragePrice;

  return {
    basic: basicResult,
    pyramid: {
      triggerPrice: parseFloat(triggerPrice.toFixed(6)),
      newAveragePrice: parseFloat(newAveragePrice.toFixed(6)),
      additionalPositionValue: parseFloat(additionalPositionValue.toFixed(6)),
      additionalMargin: parseFloat(additionalMargin.toFixed(6)),
      newStopLossPrice: parseFloat(newStopLossPrice.toFixed(6)),
      newTakeProfitPrice: parseFloat(newTakeProfitPrice.toFixed(6)),
      newRiskPercentage: parseFloat(newRiskPercentage.toFixed(6)),
      totalPositionValue: parseFloat(totalPositionValue.toFixed(6))
    }
  };
}

/**
 * 复利计算
 * @param {Object} params - 计算参数
 * @returns {Object} 计算结果
 */
function calculateCompoundInterest(params) {
  const {
    totalFunds,
    leverage,
    positionType,
    entryPrice,
    riskPercentage,
    feeRate = 0.001,
    stopLossSettings,
    compoundSettings
  } = params;

  const results = [];
  let currentFunds = totalFunds;
  
  for (let round = 1; round <= compoundSettings.rounds; round++) {
    // 计算当前轮次的交易
    const roundParams = {
      ...params,
      totalFunds: currentFunds
    };
    
    const basicResult = calculateBasicTrading(roundParams);
    
    // 计算盈利
    const profit = basicResult.profitLoss;
    const newFunds = currentFunds + profit;
    
    // 计算新的仓位大小
    const newPositionSize = (newFunds * (riskPercentage / 100)) / 
      Math.abs(entryPrice - basicResult.stopLossPrice);
    
    results.push({
      round,
      totalFunds: parseFloat(newFunds.toFixed(6)),
      profit: parseFloat(profit.toFixed(6)),
      newPositionSize: parseFloat(newPositionSize.toFixed(6))
    });
    
    currentFunds = newFunds;
  }

  return {
    basic: calculateBasicTrading(params),
    compound: results
  };
}

/**
 * 主计算函数
 * @param {Object} params - 计算参数
 * @returns {Object} 计算结果
 */
function calculateTrading(params) {
  const { calculationType } = params;
  
  switch (calculationType) {
    case 'basic':
      return {
        basic: calculateBasicTrading(params)
      };
    case 'pyramid':
      return calculatePyramidTrading(params);
    case 'compound':
      return calculateCompoundInterest(params);
    default:
      throw new Error('Invalid calculation type');
  }
}

module.exports = {
  calculateTrading,
  calculateBasicTrading,
  calculatePyramidTrading,
  calculateCompoundInterest
};