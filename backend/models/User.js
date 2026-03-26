const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // PRD Requirement: Differentiate Admin and Subscriber
  role: { 
    type: String, 
    enum: ['subscriber', 'Administrator'], 
    default: 'subscriber' 
  },
  subscriptionStatus: { type: String, default: 'active' },
  charityName: { type: String, default: "Clean Oceans Initiative" },
  charityPercentage: { type: Number, default: 10 },
  totalWon: { type: Number, default: 0 },
  dateJoined: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);