import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, '邮箱地址是必填项'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    trim: true,
    minlength: [2, '用户名至少需要2个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符'],
    select: false
  },
  isVip: {
    type: Boolean,
    default: false
  },
  vipExpiry: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 检查VIP状态中间件
userSchema.pre('save', function(next) {
  if (this.isVip && this.vipExpiry && this.vipExpiry < new Date()) {
    this.isVip = false;
    this.vipExpiry = undefined;
  }
  next();
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isVip: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);