require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Charity = require('./models/Charity');

const app = express();

// 1. DYNAMIC CORS (Crucial for Vercel -> Render communication)
app.use(cors({
  origin: "*", // During testing, allow all. For production, use your Vercel URL.
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2. INCREASE LIMITS (Required for the Winner Proof screenshots in your PRD)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. DATABASE CONNECTION
if (!process.env.MONGO_URI) {
  console.error("CRITICAL: MONGO_URI is missing from Environment Variables.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    seedAdmin();
  })
  .catch(err => {
    console.error("Database Connection Failed:", err.message);
    // On Render, don't exit(1) immediately; let the service try to reconnect
  });

// 4. SEED FUNCTION (Existing logic)
const seedAdmin = async () => {
  try {
    const adminEmail = "admin@golf.com";
    await User.findOneAndUpdate(
      { email: adminEmail }, 
      { 
        email: adminEmail,
        password: "admin123", 
        role: "Administrator",
        subscriptionStatus: "active" 
      },
      { upsert: true }
    );
    console.log("Admin Seeding Complete.");
  } catch (err) {
    console.error("Seed Error:", err);
  }
};

// 5. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/score')); 
app.use('/api/admin', require('./routes/admin'));
app.use('/api/charities', require('./routes/charity'));

// 6. RENDER SPECIFIC PORT BINDING
const PORT = process.env.PORT || 10000;
// Use '0.0.0.0' to allow Render's network to access the container
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server live on port ${PORT}`);
});
