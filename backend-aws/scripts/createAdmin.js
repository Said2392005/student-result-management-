// Run once: node scripts/createAdmin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected to Atlas ✅');

  const exists = await Admin.findOne({ username: 'admin' });
  if (exists) {
    console.log('Admin already exists ✅');
    process.exit(0);
  }

  await Admin.create({ username: 'admin', password: await bcrypt.hash('admin123', 10) });
  console.log('Admin created ✅');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
