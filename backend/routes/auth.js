const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. SIGNUP: Start users as INACTIVE
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const newUser = new User({
      email,
      password,
      role: "subscriber",
      subscriptionStatus: "inactive" // <--- FORCE INACTIVE ON SIGNUP
    });
    await newUser.save();
    res.json({ 
      success: true, 
      message: "Account created. Please subscribe to play.",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        subscriptionStatus: newUser.subscriptionStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. LOGIN: Send the status to the frontend
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ 
        success: true, 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus // "inactive" or "active"
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. RENEW (PAYMENT): Turn account to ACTIVE
router.post("/renew", async (req, res) => {
  try {
    const { userId } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscriptionStatus: "active" },
      { new: true }
    );
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;