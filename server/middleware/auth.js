const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '访问被拒绝，需要提供令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: '令牌无效' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ message: '令牌无效' });
  }
};

// 会员权限检查
const requireMembership = (requiredLevel = 'premium') => {
  return (req, res, next) => {
    const membershipLevels = { free: 0, premium: 1, vip: 2 };
    const userLevel = membershipLevels[req.user.membership.type] || 0;
    const requiredLevelValue = membershipLevels[requiredLevel] || 0;

    if (userLevel < requiredLevelValue || !req.user.isMembershipActive()) {
      return res.status(403).json({ 
        message: '需要会员权限',
        requiredLevel,
        currentLevel: req.user.membership.type
      });
    }

    next();
  };
};

module.exports = { auth, requireMembership };