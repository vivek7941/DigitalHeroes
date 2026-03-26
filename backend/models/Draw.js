const mongoose = require('mongoose');

const DrawSchema = new mongoose.Schema({
  drawDate: { type: Date, required: true },
  winningNumbers: { type: [Number], required: true }, // e.g., [5, 12, 23, 34, 45]
  winners: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchCount: { type: Number }, // 3, 4, or 5
    prizeAmount: { type: Number },
    proofUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  jackpotAmount: { type: Number, default: 0 },
  totalPoolAmount: { type: Number },
  isSimulation: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Draw || mongoose.model('Draw', DrawSchema);
