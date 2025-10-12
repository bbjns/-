const mongoose = require('mongoose');

const tradingRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calculationType: {
    type: String,
    enum: ['basic', 'pyramid', 'compound'],
    required: true
  },
  inputData: {
    totalFunds: {
      type: Number,
      required: true
    },
    leverage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    direction: {
      type: String,
      enum: ['long', 'short'],
      required: true
    },
    entryPrice: {
      type: Number,
      required: true
    },
    riskRatio: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1
    },
    feeRate: {
      type: Number,
      default: 0.001
    },
    // 浮盈加仓相关
    pyramidConfig: {
      profitTrigger: Number, // 盈利百分比触发点
      addPositionRatio: Number, // 加仓比例
      maxAdditions: {
        type: Number,
        default: 5
      }
    },
    // 复利计算相关
    compoundConfig: {
      rounds: {
        type: Number,
        default: 10
      },
      profitRate: Number // 每轮盈利率
    },
    // 止损止盈设置
    stopLossPrice: Number,
    profitLossRatio: Number
  },
  results: {
    basic: {
      stopLossPrice: Number,
      takeProfitPrice: Number,
      positionValue: Number,
      marginRequired: Number,
      fees: Number,
      profitLoss: Number,
      riskRatio: Number,
      nominalPositionValue: Number
    },
    pyramid: {
      triggerPrice: Number,
      newCostPrice: Number,
      additionalPositionValue: Number,
      additionalMargin: Number,
      newStopLossPrice: Number,
      newTakeProfitPrice: Number,
      newRiskRatio: Number,
      totalPositionValue: Number
    },
    compound: [{
      round: Number,
      totalFunds: Number,
      profit: Number,
      cumulativeProfit: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
tradingRecordSchema.index({ userId: 1, createdAt: -1 });
tradingRecordSchema.index({ calculationType: 1 });

module.exports = mongoose.model('TradingRecord', tradingRecordSchema);