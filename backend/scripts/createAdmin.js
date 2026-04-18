// Run this once with: node scripts/createAdmin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected to Atlas ✅');

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin already exists ✅');
    process.exit(0);
  }

  await Admin.create({ username: 'admin', password: 'admin123' });

  console.log('Admin created successfully ✅');
  console.log('Username: admin');
  console.log('Password: admin123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
