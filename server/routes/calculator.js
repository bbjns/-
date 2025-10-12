const express = require('express');
const { body, validationResult } = require('express-validator');
const TradingCalculation = require('../models/TradingCalculation');
const { calculateTrading } = require('../utils/calculator');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/calculator/calculate
// @desc    Perform trading calculation
// @access  Private
router.post('/calculate', auth, [
  body('calculationType').isIn(['basic', 'pyramid', 'compound']),
  body('totalFunds').isFloat({ min: 0 }),
  body('leverage').isFloat({ min: 1, max: 1000 }),
  body('positionType').isIn(['long', 'short']),
  body('entryPrice').isFloat({ min: 0 }),
  body('riskPercentage').isFloat({ min: 0, max: 100 }),
  body('feeRate').optional().isFloat({ min: 0 }),
  body('stopLossSettings.type').isIn(['price', 'ratio']),
  body('stopLossSettings.stopLossPrice').optional().isFloat({ min: 0 }),
  body('stopLossSettings.profitLossRatio').optional().isFloat({ min: 0 }),
  body('pyramidSettings.profitTriggerPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('pyramidSettings.pyramidPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('compoundSettings.rounds').optional().isInt({ min: 1, max: 50 }),
  body('compoundSettings.profitPercentage').optional().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const calculationData = {
      ...req.body,
      userId: req.userId
    };

    // Perform calculation
    const results = calculateTrading(calculationData);

    // Save calculation to database
    const tradingCalculation = new TradingCalculation({
      userId: req.userId,
      calculationType: calculationData.calculationType,
      input: calculationData,
      results: results
    });

    await tradingCalculation.save();

    res.json({
      success: true,
      results,
      calculationId: tradingCalculation._id
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Calculation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/calculator/history
// @desc    Get user's calculation history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.userId };
    if (type) {
      query.calculationType = type;
    }

    const calculations = await TradingCalculation
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('calculationType input results createdAt');

    const total = await TradingCalculation.countDocuments(query);

    res.json({
      success: true,
      calculations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch calculation history'
    });
  }
});

// @route   GET /api/calculator/history/:id
// @desc    Get specific calculation details
// @access  Private
router.get('/history/:id', auth, async (req, res) => {
  try {
    const calculation = await TradingCalculation.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!calculation) {
      return res.status(404).json({ 
        success: false,
        message: 'Calculation not found'
      });
    }

    res.json({
      success: true,
      calculation
    });
  } catch (error) {
    console.error('Get calculation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch calculation'
    });
  }
});

// @route   DELETE /api/calculator/history/:id
// @desc    Delete calculation
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const calculation = await TradingCalculation.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!calculation) {
      return res.status(404).json({ 
        success: false,
        message: 'Calculation not found'
      });
    }

    res.json({
      success: true,
      message: 'Calculation deleted successfully'
    });
  } catch (error) {
    console.error('Delete calculation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete calculation'
    });
  }
});

// @route   GET /api/calculator/statistics
// @desc    Get user's calculation statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    const stats = await TradingCalculation.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$calculationType',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      }
    ]);

    const totalCalculations = await TradingCalculation.countDocuments({ userId: req.userId });
    const recentCalculations = await TradingCalculation
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('calculationType createdAt');

    res.json({
      success: true,
      statistics: {
        totalCalculations,
        byType: stats,
        recentCalculations
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;