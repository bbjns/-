const Decimal = require('decimal.js');

// 设置精度为6位小数
Decimal.set({ precision: 6, rounding: Decimal.ROUND_HALF_UP });

class SpeculationCalculator {
  constructor() {
    this.feeRate = new Decimal(0.001); // 默认手续费率0.1%
  }

  // 基础计算
  calculateBasic(params) {
    const {
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate = 0.001,
      stopLossPrice,
      profitLossRatio
    } = params;

    const funds = new Decimal(totalFunds);
    const lev = new Decimal(leverage);
    const price = new Decimal(entryPrice);
    const risk = new Decimal(riskRatio);
    const fee = new Decimal(feeRate);

    // 计算可用的风险资金
    const riskFunds = funds.mul(risk);
    
    // 计算名义仓位价值
    const nominalPositionValue = riskFunds.mul(lev);
    
    // 计算开仓数量
    const positionSize = nominalPositionValue.div(price);
    
    // 计算保证金
    const marginRequired = nominalPositionValue.div(lev);
    
    // 计算手续费
    const fees = nominalPositionValue.mul(fee);
    
    // 计算止损止盈价格
    let stopLoss, takeProfit;
    
    if (stopLossPrice) {
      stopLoss = new Decimal(stopLossPrice);
      const priceDiff = direction === 'long' 
        ? price.sub(stopLoss) 
        : stopLoss.sub(price);
      const profitLoss = positionSize.mul(priceDiff);
      takeProfit = direction === 'long'
        ? price.add(priceDiff)
        : price.sub(priceDiff);
    } else if (profitLossRatio) {
      const ratio = new Decimal(profitLossRatio);
      const stopLossDistance = price.mul(risk).div(lev);
      stopLoss = direction === 'long'
        ? price.sub(stopLossDistance)
        : price.add(stopLossDistance);
      const profitDistance = stopLossDistance.mul(ratio);
      takeProfit = direction === 'long'
        ? price.add(profitDistance)
        : price.sub(profitDistance);
    }

    // 计算平仓盈亏
    const profitLoss = positionSize.mul(
      direction === 'long' 
        ? takeProfit.sub(price)
        : price.sub(takeProfit)
    );

    return {
      stopLossPrice: stopLoss.toFixed(6),
      takeProfitPrice: takeProfit.toFixed(6),
      positionValue: positionSize.toFixed(6),
      marginRequired: marginRequired.toFixed(6),
      fees: fees.toFixed(6),
      profitLoss: profitLoss.toFixed(6),
      riskRatio: risk.toFixed(6),
      nominalPositionValue: nominalPositionValue.toFixed(6)
    };
  }

  // 浮盈加仓计算
  calculatePyramid(params) {
    const {
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate = 0.001,
      profitTrigger,
      addPositionRatio,
      maxAdditions = 5,
      stopLossPrice,
      profitLossRatio
    } = params;

    const funds = new Decimal(totalFunds);
    const lev = new Decimal(leverage);
    const price = new Decimal(entryPrice);
    const risk = new Decimal(riskRatio);
    const fee = new Decimal(feeRate);
    const trigger = new Decimal(profitTrigger).div(100); // 转换为小数
    const addRatio = new Decimal(addPositionRatio).div(100); // 转换为小数

    // 基础计算
    const basicResult = this.calculateBasic(params);
    
    // 计算触发价格
    const triggerPrice = direction === 'long'
      ? price.mul(new Decimal(1).add(trigger))
      : price.mul(new Decimal(1).sub(trigger));

    // 计算加仓后的成本价
    const currentPositionSize = new Decimal(basicResult.positionValue);
    const addPositionValue = funds.mul(addRatio);
    const addPositionSize = addPositionValue.div(triggerPrice);
    const newTotalSize = currentPositionSize.add(addPositionSize);
    const newCostPrice = currentPositionSize.mul(price).add(addPositionSize.mul(triggerPrice)).div(newTotalSize);

    // 计算加仓保证金
    const additionalMargin = addPositionValue.div(lev);
    const additionalFees = addPositionValue.mul(fee);

    // 重新计算止损止盈
    let newStopLoss, newTakeProfit;
    if (stopLossPrice) {
      newStopLoss = new Decimal(stopLossPrice);
      const priceDiff = direction === 'long' 
        ? newCostPrice.sub(newStopLoss) 
        : newStopLoss.sub(newCostPrice);
      newTakeProfit = direction === 'long'
        ? newCostPrice.add(priceDiff)
        : newCostPrice.sub(priceDiff);
    } else if (profitLossRatio) {
      const ratio = new Decimal(profitLossRatio);
      const stopLossDistance = newCostPrice.mul(risk).div(lev);
      newStopLoss = direction === 'long'
        ? newCostPrice.sub(stopLossDistance)
        : newCostPrice.add(stopLossDistance);
      const profitDistance = stopLossDistance.mul(ratio);
      newTakeProfit = direction === 'long'
        ? newCostPrice.add(profitDistance)
        : newCostPrice.sub(profitDistance);
    }

    // 计算新的风险占比
    const newRiskRatio = newTotalSize.mul(newCostPrice).div(funds);

    return {
      ...basicResult,
      pyramid: {
        triggerPrice: triggerPrice.toFixed(6),
        newCostPrice: newCostPrice.toFixed(6),
        additionalPositionValue: addPositionValue.toFixed(6),
        additionalMargin: additionalMargin.toFixed(6),
        additionalFees: additionalFees.toFixed(6),
        newStopLossPrice: newStopLoss.toFixed(6),
        newTakeProfitPrice: newTakeProfit.toFixed(6),
        newRiskRatio: newRiskRatio.toFixed(6),
        totalPositionValue: newTotalSize.mul(newCostPrice).toFixed(6)
      }
    };
  }

  // 复利计算
  calculateCompound(params) {
    const {
      totalFunds,
      profitRate,
      rounds = 10
    } = params;

    const funds = new Decimal(totalFunds);
    const rate = new Decimal(profitRate).div(100); // 转换为小数
    const results = [];
    let currentFunds = funds;
    let cumulativeProfit = new Decimal(0);

    for (let i = 1; i <= rounds; i++) {
      const profit = currentFunds.mul(rate);
      cumulativeProfit = cumulativeProfit.add(profit);
      currentFunds = currentFunds.add(profit);

      results.push({
        round: i,
        totalFunds: currentFunds.toFixed(6),
        profit: profit.toFixed(6),
        cumulativeProfit: cumulativeProfit.toFixed(6)
      });
    }

    return results;
  }

  // 综合计算
  calculateAll(params) {
    const results = {
      basic: this.calculateBasic(params)
    };

    if (params.profitTrigger && params.addPositionRatio) {
      results.pyramid = this.calculatePyramid(params);
    }

    if (params.profitRate) {
      results.compound = this.calculateCompound(params);
    }

    return results;
  }
}

module.exports = new SpeculationCalculator();