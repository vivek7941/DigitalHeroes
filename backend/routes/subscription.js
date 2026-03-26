const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Charity = require('../models/Charity');

// Get subscription price
const MONTHLY_PRICE = 9.99;
const YEARLY_PRICE = 99.99;

// POST - Create/Renew subscription (mock payment)
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, plan, charityId } = req.body;
    
    if (!userId || !plan) {
      return res.status(400).json({ error: "userId and plan are required" });
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: "plan must be 'monthly' or 'yearly'" });
    }

    const amount = plan === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
    const charityPercentage = 10; // Minimum 10% to charity

    // Calculate expiration date
    let expirationDate = new Date();
    if (plan === 'monthly') {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    // Get charity name
    let charityName = "Clean Oceans Initiative";
    if (charityId) {
      const charity = await Charity.findOne({ id: charityId });
      if (charity) charityName = charity.name;
    }

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan,
        amount,
        charityPercentage,
        charityName,
        expirationDate,
        status: 'active',
        lastPaymentDate: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Update user status
    await User.findByIdAndUpdate(userId, { 
      subscriptionStatus: 'active',
      charityName 
    });

    // Update charity donation total (10% of subscription)
    const charityAmount = (amount * charityPercentage / 100).toFixed(2);
    if (charityId) {
      await Charity.findOneAndUpdate(
        { id: charityId },
        { $inc: { totalDonated: parseFloat(charityAmount) } },
        { returnDocument: 'after' }
      );
    }

    res.json({
      success: true,
      subscription,
      charityDonation: charityAmount,
      message: `Subscription activated. $${charityAmount} donated to ${charityName}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get subscription status
router.get('/:userId', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.params.userId });
    
    if (!subscription) {
      return res.json({ 
        status: 'inactive',
        message: "No active subscription"
      });
    }

    // Check if subscription has expired
    const isExpired = new Date() > subscription.expirationDate;
    
    if (isExpired && subscription.status === 'active') {
      subscription.status = 'lapsed';
      await subscription.save();
      await User.findByIdAndUpdate(req.params.userId, { subscriptionStatus: 'lapsed' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET pricing
router.get('/plans/pricing', (req, res) => {
  res.json({
    monthly: {
      price: MONTHLY_PRICE,
      charity: (MONTHLY_PRICE * 0.1).toFixed(2)
    },
    yearly: {
      price: YEARLY_PRICE,
      charity: (YEARLY_PRICE * 0.1).toFixed(2)
    }
  });
});

// POST - Cancel subscription
router.post('/:userId/cancel', async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.params.userId },
      { status: 'canceled' },
      { new: true }
    );
    
    await User.findByIdAndUpdate(req.params.userId, { subscriptionStatus: 'inactive' });
    
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
