const mongoose = require('mongoose');

const tradingCalculationSchema = new mongoose.Schema({
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
  input: {
    // Basic calculation inputs
    totalFunds: {
      type: Number,
      required: true,
      min: 0
    },
    leverage: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    positionType: {
      type: String,
      enum: ['long', 'short'],
      required: true
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0
    },
    riskPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    feeRate: {
      type: Number,
      default: 0.001, // 0.1% default
      min: 0
    },
    // Pyramid trading inputs
    pyramidSettings: {
      profitTriggerPercentage: {
        type: Number,
        min: 0,
        max: 100
      },
      pyramidPercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    // Stop loss / Take profit settings
    stopLossSettings: {
      type: {
        type: String,
        enum: ['price', 'ratio'],
        required: true
      },
      stopLossPrice: Number,
      profitLossRatio: Number
    },
    // Compound interest settings
    compoundSettings: {
      rounds: {
        type: Number,
        min: 1,
        max: 50
      },
      profitPercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  results: {
    // Basic calculation results
    basic: {
      stopLossPrice: Number,
      takeProfitPrice: Number,
      positionSize: Number,
      marginRequired: Number,
      fees: Number,
      profitLoss: Number,
      riskPercentage: Number,
      nominalPositionValue: Number
    },
    // Pyramid trading results
    pyramid: {
      triggerPrice: Number,
      newAveragePrice: Number,
      additionalPositionValue: Number,
      additionalMargin: Number,
      newStopLossPrice: Number,
      newTakeProfitPrice: Number,
      newRiskPercentage: Number,
      totalPositionValue: Number
    },
    // Compound interest results
    compound: [{
      round: Number,
      totalFunds: Number,
      profit: Number,
      newPositionSize: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
tradingCalculationSchema.index({ userId: 1, createdAt: -1 });
tradingCalculationSchema.index({ calculationType: 1 });

module.exports = mongoose.model('TradingCalculation', tradingCalculationSchema);