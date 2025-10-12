const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  membership: {
    type: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['zh', 'en', 'ko'],
      default: 'zh'
    },
    theme: {
      type: String,
      enum: ['financial', 'dark', 'light'],
      default: 'financial'
    },
    currency: {
      type: String,
      default: 'USDT'
    }
  },
  tradingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TradingRecord'
  }],
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 检查会员状态
userSchema.methods.isMembershipActive = function() {
  if (!this.membership.isActive) return false;
  if (!this.membership.endDate) return false;
  return new Date() < this.membership.endDate;
};

module.exports = mongoose.model('User', userSchema);