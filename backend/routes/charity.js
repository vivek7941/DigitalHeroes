const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');

// GET all charities
router.get('/', async (req, res) => {
  try {
    const charities = await Charity.find();
    res.json(charities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single charity by ID
router.get('/:charityId', async (req, res) => {
  try {
    const charity = await Charity.findOne({ id: req.params.charityId });
    if (!charity) return res.status(404).json({ error: "Charity not found" });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new charity (admin only)
router.post('/', async (req, res) => {
  try {
    const { id, name, description, imageUrl, website } = req.body;
    const newCharity = new Charity({ id, name, description, imageUrl, website });
    await newCharity.save();
    res.status(201).json(newCharity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update charity donation total
router.patch('/:charityId/donate', async (req, res) => {
  try {
    const { amount } = req.body;
    const charity = await Charity.findOneAndUpdate(
      { id: req.params.charityId },
      { $inc: { totalDonated: amount } },
      { new: true }
    );
    res.json(charity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
