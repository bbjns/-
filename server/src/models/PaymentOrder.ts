import mongoose, { Schema } from 'mongoose';
import Decimal from 'decimal.js';
import { IPaymentOrder } from '../types';

// Decimal类型转换器
const DecimalType = {
  type: Schema.Types.Mixed,
  get: (value: any) => value ? new Decimal(value) : value,
  set: (value: any) => value ? value.toString() : value
};

const paymentOrderSchema = new Schema<IPaymentOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必填项']
  },
  amount: {
    ...DecimalType,
    required: [true, '支付金额是必填项']
  },
  method: {
    type: String,
    enum: ['usdt', 'alipay'],
    required: [true, '支付方式是必填项']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentData: {
    type: Schema.Types.Mixed,
    default: {}
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
paymentOrderSchema.index({ userId: 1 });
paymentOrderSchema.index({ status: 1 });
paymentOrderSchema.index({ method: 1 });
paymentOrderSchema.index({ createdAt: -1 });
paymentOrderSchema.index({ transactionId: 1 });

export const PaymentOrder = mongoose.model<IPaymentOrder>('PaymentOrder', paymentOrderSchema);