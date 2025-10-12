import mongoose, { Schema } from 'mongoose';
import { ICalculationHistory } from '../types';

const calculationHistorySchema = new Schema<ICalculationHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: true
  },
  input: {
    totalFunds: { type: String, required: true },
    leverage: { type: String, required: true },
    direction: { type: String, enum: ['long', 'short'], required: true },
    entryPrice: { type: String, required: true },
    riskRatio: { type: String, required: true },
    feeRate: { type: String, required: true },
    stopLoss: { type: String },
    profitLossRatio: { type: String },
    profitAddEnabled: { type: Boolean, required: true },
    profitThreshold: { type: String },
    addPositionRatio: { type: String }
  },
  result: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// 索引
calculationHistorySchema.index({ userId: 1 });
calculationHistorySchema.index({ sessionId: 1 });
calculationHistorySchema.index({ createdAt: -1 });

export const CalculationHistory = mongoose.model<ICalculationHistory>('CalculationHistory', calculationHistorySchema);