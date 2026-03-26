const express = require('express');
const router = express.Router();
const Score = require('../models/score');

// POST /api/scores - Add a new score
router.post('/', async (req, res) => {
  try {
    const { userId, value, date, proofUrl } = req.body;
    if (!userId || !value || !date) {
      return res.status(400).json({ error: "userId, value, and date are required" });
    }

    // Get user's current scores (ordered by createdAt, newest first)
    const userScores = await Score.find({ userId }).sort({ createdAt: -1 }).limit(5);

    // If user already has 5 scores, delete the oldest one by createdAt
    if (userScores.length >= 5) {
      const oldestScore = await Score.find({ userId }).sort({ createdAt: 1 }).limit(1);
      if (oldestScore.length > 0) {
        await Score.deleteOne({ _id: oldestScore[0]._id });
      }
    }

    // Add new score
    const newScore = new Score({ userId, value, date, proofUrl });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scores/add - Add a new score (alternative path)
router.post('/add', async (req, res) => {
  try {
    const { userId, value, date, proofUrl } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get user's current scores (ordered by createdAt, newest first)
    const userScores = await Score.find({ userId }).sort({ createdAt: -1 }).limit(5);

    // If user already has 5 scores, delete the oldest one by createdAt
    if (userScores.length >= 5) {
      const oldestScore = await Score.find({ userId }).sort({ createdAt: 1 }).limit(1);
      if (oldestScore.length > 0) {
        await Score.deleteOne({ _id: oldestScore[0]._id });
      }
    }

    // Add new score
    const newScore = new Score({ userId, value, date: date || new Date(), proofUrl });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scores - Get all scores
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().populate('userId').sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scores/:userId - Get scores for a specific user (last 5)
router.get('/:userId', async (req, res) => {
  try {
    if (!req.params.userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const scores = await Score.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(5);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/scores/:scoreId - Delete a specific score
router.delete('/:scoreId', async (req, res) => {
  try {
    await Score.deleteOne({ _id: req.params.scoreId });
    res.json({ success: true, message: "Score deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;