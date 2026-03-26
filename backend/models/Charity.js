const mongoose = require('mongoose');

const CharitySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // c1, c2, etc.
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  website: { type: String },
  totalDonated: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Charity || mongoose.model('Charity', CharitySchema);
