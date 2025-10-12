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
    trim: true,
    maxlength: 50
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
      enum: ['zh', 'ko', 'en'],
      default: 'zh'
    },
    theme: {
      type: String,
      enum: ['classic', 'modern', 'dark'],
      default: 'classic'
    }
  },
  tradingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TradingCalculation'
  }],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if membership is active
userSchema.methods.isMembershipActive = function() {
  if (!this.membership.isActive) return false;
  if (!this.membership.endDate) return false;
  return new Date() < this.membership.endDate;
};

module.exports = mongoose.model('User', userSchema);