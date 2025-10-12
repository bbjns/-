const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const calculator = require('../utils/calculator');
const TradingRecord = require('../models/TradingRecord');

const router = express.Router();

// 验证规则
const calculationValidation = [
  body('totalFunds').isNumeric().withMessage('总资金必须是数字'),
  body('leverage').isNumeric().isFloat({ min: 1, max: 100 }).withMessage('杠杆必须在1-100之间'),
  body('direction').isIn(['long', 'short']).withMessage('方向必须是做多或做空'),
  body('entryPrice').isNumeric().withMessage('开仓价必须是数字'),
  body('riskRatio').isNumeric().isFloat({ min: 0.01, max: 1 }).withMessage('风险占比必须在0.01-1之间'),
  body('feeRate').optional().isNumeric().isFloat({ min: 0, max: 0.1 }).withMessage('手续费率必须在0-0.1之间'),
  body('stopLossPrice').optional().isNumeric().withMessage('止损价必须是数字'),
  body('profitLossRatio').optional().isNumeric().withMessage('盈亏比必须是数字'),
  body('profitTrigger').optional().isNumeric().withMessage('盈利触发点必须是数字'),
  body('addPositionRatio').optional().isNumeric().withMessage('加仓比例必须是数字'),
  body('profitRate').optional().isNumeric().withMessage('盈利率必须是数字'),
  body('rounds').optional().isInt({ min: 1, max: 100 }).withMessage('复利轮数必须在1-100之间')
];

// 基础计算
router.post('/basic', auth, calculationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate = 0.001,
      stopLossPrice,
      profitLossRatio
    } = req.body;

    // 验证止损价和盈亏比至少有一个
    if (!stopLossPrice && !profitLossRatio) {
      return res.status(400).json({ 
        message: '必须提供止损价或盈亏比中的一个' 
      });
    }

    const result = calculator.calculateBasic({
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate,
      stopLossPrice,
      profitLossRatio
    });

    // 保存计算记录
    const record = new TradingRecord({
      userId: req.user.id,
      calculationType: 'basic',
      inputData: {
        totalFunds,
        leverage,
        direction,
        entryPrice,
        riskRatio,
        feeRate,
        stopLossPrice,
        profitLossRatio
      },
      results: { basic: result }
    });

    await record.save();

    res.json({
      success: true,
      data: result,
      recordId: record._id
    });
  } catch (error) {
    console.error('计算错误:', error);
    res.status(500).json({ 
      message: '计算失败',
      error: error.message 
    });
  }
});

// 浮盈加仓计算
router.post('/pyramid', auth, calculationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate = 0.001,
      stopLossPrice,
      profitLossRatio,
      profitTrigger,
      addPositionRatio,
      maxAdditions = 5
    } = req.body;

    if (!profitTrigger || !addPositionRatio) {
      return res.status(400).json({ 
        message: '浮盈加仓计算需要提供盈利触发点和加仓比例' 
      });
    }

    const result = calculator.calculatePyramid({
      totalFunds,
      leverage,
      direction,
      entryPrice,
      riskRatio,
      feeRate,
      stopLossPrice,
      profitLossRatio,
      profitTrigger,
      addPositionRatio,
      maxAdditions
    });

    // 保存计算记录
    const record = new TradingRecord({
      userId: req.user.id,
      calculationType: 'pyramid',
      inputData: {
        totalFunds,
        leverage,
        direction,
        entryPrice,
        riskRatio,
        feeRate,
        stopLossPrice,
        profitLossRatio,
        pyramidConfig: {
          profitTrigger,
          addPositionRatio,
          maxAdditions
        }
      },
      results: result
    });

    await record.save();

    res.json({
      success: true,
      data: result,
      recordId: record._id
    });
  } catch (error) {
    console.error('浮盈加仓计算错误:', error);
    res.status(500).json({ 
      message: '计算失败',
      error: error.message 
    });
  }
});

// 复利计算
router.post('/compound', auth, [
  body('totalFunds').isNumeric().withMessage('总资金必须是数字'),
  body('profitRate').isNumeric().withMessage('盈利率必须是数字'),
  body('rounds').optional().isInt({ min: 1, max: 100 }).withMessage('复利轮数必须在1-100之间')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { totalFunds, profitRate, rounds = 10 } = req.body;

    const result = calculator.calculateCompound({
      totalFunds,
      profitRate,
      rounds
    });

    // 保存计算记录
    const record = new TradingRecord({
      userId: req.user.id,
      calculationType: 'compound',
      inputData: {
        totalFunds,
        compoundConfig: {
          profitRate,
          rounds
        }
      },
      results: { compound: result }
    });

    await record.save();

    res.json({
      success: true,
      data: result,
      recordId: record._id
    });
  } catch (error) {
    console.error('复利计算错误:', error);
    res.status(500).json({ 
      message: '计算失败',
      error: error.message 
    });
  }
});

// 综合计算
router.post('/all', auth, calculationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = calculator.calculateAll(req.body);

    // 保存计算记录
    const record = new TradingRecord({
      userId: req.user.id,
      calculationType: 'basic',
      inputData: req.body,
      results: result
    });

    await record.save();

    res.json({
      success: true,
      data: result,
      recordId: record._id
    });
  } catch (error) {
    console.error('综合计算错误:', error);
    res.status(500).json({ 
      message: '计算失败',
      error: error.message 
    });
  }
});

// 获取计算历史
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (type) {
      query.calculationType = type;
    }

    const records = await TradingRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-results -inputData');

    const total = await TradingRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({ 
      message: '获取历史记录失败',
      error: error.message 
    });
  }
});

// 获取单个计算记录详情
router.get('/record/:id', auth, async (req, res) => {
  try {
    const record = await TradingRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!record) {
      return res.status(404).json({ message: '记录不存在' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取记录详情错误:', error);
    res.status(500).json({ 
      message: '获取记录详情失败',
      error: error.message 
    });
  }
});

module.exports = router;