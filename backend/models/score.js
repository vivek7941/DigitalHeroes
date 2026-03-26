const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 1, max: 45 }, 
  date: { type: Date, required: true },
  proofUrl: { type: String, default: "" },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }, // Required for PRD
  createdAt: { type: Date, default: Date.now }
});

ScoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);