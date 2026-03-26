const express = require("express");
const router = express.Router();
const Score = require("../models/score");
const User = require("../models/User");
const Draw = require("../models/Draw");
const Subscription = require("../models/Subscription");

// 1. GET: Financial Overview
router.get("/reports", async (req, res) => {
  try {
    const activeSubscribers = await Subscription.countDocuments({ status: "active" });
    const totalRevenue = activeSubscribers * 10;
    res.json({
      activeSubscribers,
      poolValue: (totalRevenue * 0.5).toFixed(2),
      charityTotal: (totalRevenue * 0.1).toFixed(2),
      jackpotAmount: 5000.00
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Simulation Draw (test mode)
router.post("/simulate-draw", async (req, res) => {
  try {
    const { isSimulation } = req.body;
    
    // Get all active scores
    const allScores = await Score.find().populate('userId');

    if (allScores.length === 0) {
      return res.json({ 
        success: false, 
        winningNumbers: [], 
        message: "No scores found to draw from." 
      });
    }

    // Generate 5 random winning numbers (1-50)
    const winningNumbers = [];
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num);
      }
    }

    // Build weighted pool (higher Stableford = more entries)
    let weightedPool = [];
    allScores.forEach(score => {
      for (let i = 0; i < score.value; i++) {
        weightedPool.push({
          userId: score.userId._id,
          email: score.userId.email,
          score: score.value
        });
      }
    });

    // Find potential winners by matching scores
    const winners = [];
    const uniqueUsers = [...new Set(allScores.map(s => s.userId._id.toString()))];

    uniqueUsers.forEach(userId => {
      const userScores = allScores.filter(s => s.userId._id.toString() === userId);
      let matches = 0;
      userScores.forEach(score => {
        if (winningNumbers.includes(score.value)) matches++;
      });

      if (matches >= 3) {
        winners.push({
          userId,
          matchCount: matches
        });
      }
    });

    // Save draw (only if not simulation)
    if (!isSimulation) {
      const draw = new Draw({
        drawDate: new Date(),
        winningNumbers,
        winners: winners.map(w => ({
          userId: w.userId,
          matchCount: w.matchCount,
          status: 'pending'
        })),
        isSimulation: false
      });
      await draw.save();
    }

    res.json({
      success: true,
      winningNumbers,
      totalScores: allScores.length,
      matchedUsers: winners.length,
      winners,
      isSimulation: isSimulation || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST: Run Official Draw with Tiered Prizing
router.post("/run-draw", async (req, res) => {
  try {
    const allScores = await Score.find().populate('userId');

    if (allScores.length === 0) {
      return res.json({ 
        success: false, 
        message: "No scores found to draw from." 
      });
    }

    // Generate 5 random winning numbers
    const winningNumbers = [];
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num);
      }
    }

    // Calculate prize pool (assume 50% of revenue goes to prizes)
    const totalPoolAmount = 5000; // Mock amount
    const prizes = {
      5: (totalPoolAmount * 0.40), // 40% for 5-match
      4: (totalPoolAmount * 0.35), // 35% for 4-match
      3: (totalPoolAmount * 0.25)  // 25% for 3-match
    };

    // Find winners
    const winnerMap = {};
    const uniqueUsers = [...new Set(allScores.map(s => s.userId._id.toString()))];

    uniqueUsers.forEach(userId => {
      const userScores = allScores.filter(s => s.userId._id.toString() === userId);
      let matches = 0;
      userScores.forEach(score => {
        if (winningNumbers.includes(score.value)) matches++;
      });

      if (matches >= 3) {
        winnerMap[userId] = matches;
      }
    });

    // Calculate individual prizes and create winners array
    const winners = Object.entries(winnerMap).map(([userId, matches]) => ({
      userId,
      matchCount: matches,
      prizeAmount: prizes[matches] || 0,
      status: 'pending'
    }));

    // Save official draw
    const draw = new Draw({
      drawDate: new Date(),
      winningNumbers,
      winners,
      totalPoolAmount,
      isSimulation: false
    });
    await draw.save();

    res.json({
      success: true,
      draw: {
        winningNumbers,
        totalWinners: winners.length,
        prizes,
        winners
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET: All draws history
router.get("/draws", async (req, res) => {
  try {
    const draws = await Draw.find().populate('winners.userId').sort({ drawDate: -1 });
    res.json(draws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST: Verify winner proof
router.post("/verify-winner/:drawId/:winnerId", async (req, res) => {
  try {
    const { drawId, winnerId } = req.params;
    const { adminId, isApproved, proofUrl } = req.body;

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ error: "Draw not found" });

    const winner = draw.winners.find(w => w._id.toString() === winnerId);
    if (!winner) return res.status(404).json({ error: "Winner not found" });

    winner.status = isApproved ? 'approved' : 'rejected';
    winner.verifiedBy = adminId;
    winner.proofUrl = proofUrl;

    await draw.save();

    // If approved, update user's totalWon
    if (isApproved) {
      await User.findByIdAndUpdate(winner.userId, {
        $inc: { totalWon: winner.prizeAmount }
      });
    }

    res.json({ success: true, winner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET: Pending winner verifications
router.get("/pending-verifications", async (req, res) => {
  try {
    const draws = await Draw.find({
      'winners.status': 'pending'
    }).populate('winners.userId');

    const pendingWinners = [];
    draws.forEach(draw => {
      draw.winners.forEach(winner => {
        if (winner.status === 'pending') {
          pendingWinners.push({
            drawId: draw._id,
            winnerId: winner._id,
            userId: winner.userId?._id,
            userEmail: winner.userId?.email || 'Unknown',
            matchCount: winner.matchCount,
            prizeAmount: winner.prizeAmount,
            proofUrl: winner.proofUrl || null,
            drawDate: draw.drawDate
          });
        }
      });
    });

    res.json(pendingWinners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. POST: Upload proof image for the user
router.post("/upload-proof", async (req, res) => {
  try {
    const { userId, proofUrl } = req.body;
    if (!userId || !proofUrl) {
      return res.status(400).json({ success: false, message: 'userId and proofUrl are required' });
    }

    const draw = await Draw.findOne({
      'winners.userId': userId,
      'winners.status': 'pending'
    }).sort({ drawDate: -1 });

    if (!draw) {
      return res.status(404).json({ success: false, message: 'No pending draw found for user' });
    }

    const winner = draw.winners.find(w => w.userId.toString() === userId.toString() && w.status === 'pending');
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Pending winner entry not found' });
    }

    winner.proofUrl = proofUrl;
    winner.status = 'pending';
    await draw.save();

    res.json({ success: true, message: 'Proof uploaded', proofUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;