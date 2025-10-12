const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Membership plans
const MEMBERSHIP_PLANS = {
  premium: {
    name: 'Premium',
    price: 29.99,
    duration: 30, // days
    features: ['Unlimited calculations', 'Advanced analytics', 'Priority support']
  },
  vip: {
    name: 'VIP',
    price: 99.99,
    duration: 30, // days
    features: ['All Premium features', 'Custom themes', 'API access', 'Personal consultant']
  }
};

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for membership
// @access  Private
router.post('/create-intent', auth, [
  body('membershipType').isIn(['premium', 'vip']),
  body('paymentMethod').isIn(['stripe', 'usdt', 'alipay'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { membershipType, paymentMethod } = req.body;
    const plan = MEMBERSHIP_PLANS[membershipType];

    if (!plan) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid membership type'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: user._id.toString(),
          membershipType,
          duration: plan.duration
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: plan.price,
        currency: 'usd'
      });
    } else if (paymentMethod === 'usdt') {
      // Generate USDT payment info
      const paymentId = `usdt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        success: true,
        paymentId,
        amount: plan.price,
        currency: 'USDT',
        walletAddress: process.env.USDT_WALLET_ADDRESS,
        instructions: 'Please send the exact amount to the provided wallet address and include the payment ID in the memo field.'
      });
    } else if (paymentMethod === 'alipay') {
      // For Alipay, we would integrate with Alipay API
      // This is a simplified implementation
      const paymentId = `alipay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        success: true,
        paymentId,
        amount: plan.price,
        currency: 'CNY',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
        instructions: 'Please scan the QR code with Alipay to complete payment.'
      });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and activate membership
// @access  Private
router.post('/confirm', auth, [
  body('paymentId').notEmpty(),
  body('membershipType').isIn(['premium', 'vip']),
  body('paymentMethod').isIn(['stripe', 'usdt', 'alipay'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, membershipType, paymentMethod } = req.body;
    const plan = MEMBERSHIP_PLANS[membershipType];

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    // In a real implementation, you would verify the payment here
    // For now, we'll simulate successful payment

    // Calculate membership end date
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Update user membership
    user.membership = {
      type: membershipType,
      startDate,
      endDate,
      isActive: true
    };

    await user.save();

    res.json({
      success: true,
      message: 'Membership activated successfully',
      membership: user.membership
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// @route   GET /api/payments/plans
// @desc    Get available membership plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: MEMBERSHIP_PLANS
  });
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, membershipType, duration } = paymentIntent.metadata;

    try {
      const user = await User.findById(userId);
      if (user) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (parseInt(duration) * 24 * 60 * 60 * 1000));

        user.membership = {
          type: membershipType,
          startDate,
          endDate,
          isActive: true
        };

        await user.save();
        console.log(`Membership activated for user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

module.exports = router;