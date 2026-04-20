const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) return error('Username and password are required', 400);

    const existing = await Admin.findOne({ username });
    if (existing) return error('Admin already exists', 400);

    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hashed });

    return success({ message: 'Admin created ✅' }, 201);
  } catch (err) {
    return error(err.message);
  }
};
