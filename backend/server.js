require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Import the User model for seeding
const Charity = require('./models/Charity'); // Import Charity model

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
if (!process.env.MONGO_URI) {
  console.error(" MONGO_URI is not set in .env. Please configure it before running server.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" MongoDB Connected Successfully");
    // 2. RUN THE SEED FUNCTION AFTER CONNECTION IS SUCCESSFUL
    seedAdmin();
  })
  .catch(err => {
    console.error(" Connection Error:", err.message);
    console.error(" Check Atlas IP whitelist and credentials. Exiting process.");
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error(" MongoDB connection lost:", err.message);
});

// 3. ADMIN SEED FUNCTION (Ensures admin@golf.com always exists and charities are seeded)
const seedAdmin = async () => {
  try {
    const adminEmail = "admin@golf.com";
    const adminPassword = "admin123"; 
    
    // Seed admin user
    await User.findOneAndUpdate(
      { email: adminEmail }, 
      { 
        email: adminEmail,
        password: adminPassword, 
        role: "Administrator",
        charityName: "System Admin",
        subscriptionStatus: "active" 
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    
    console.log(" Admin System Check: Admin account is ready.");

    // Seed charities
    const charities = [
      {
        id: "c1",
        name: "Green Earth Foundation",
        description: "Protecting our planet's forests, wildlife, and natural ecosystems",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
        website: "https://greenearth.org"
      },
      {
        id: "c2",
        name: "Clean Oceans Initiative",
        description: "Cleaning our oceans and protecting marine life from plastic pollution",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
        website: "https://cleanoceans.org"
      }
    ];

    for (const charity of charities) {
      await Charity.findOneAndUpdate(
        { id: charity.id },
        charity,
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log(" Charities seeded successfully.");
  } catch (err) {
    console.error(" Seed Error:", err);
  }
};

// 4. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/score')); 
app.use('/api/admin', require('./routes/admin'));
app.use('/api/charities', require('./routes/charity'));
app.use('/api/subscription', require('./routes/subscription'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});