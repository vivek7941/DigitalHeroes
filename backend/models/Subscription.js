const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['monthly', 'yearly'], required: true },
  amount: { type: Number, required: true },
  charityPercentage: { type: Number, default: 10 },
  startDate: { type: Date, default: Date.now },
  expirationDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'lapsed', 'canceled'], default: 'active' },
  paymentMethod: { type: String },
  lastPaymentDate: { type: Date },
  charityName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
