const express = require("express");
const router = express.Router();
const User = require("../models/User");

// SIGNUP (PRD Section 08 compliance) [cite: 76]
router.post("/signup", async (req, res) => {
  try {
    const { email, password, charityName, charityPercentage } = req.body;
    const user = new User({
      email,
      password, // Note: Use bcrypt for real hashing later
      charityName,
      charityPercentage: Math.max(charityPercentage || 10, 10)
    });
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: "Signup failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) res.json({ success: true, user });
  else res.status(401).json({ success: false, message: "Invalid credentials" });
});

module.exports = router;