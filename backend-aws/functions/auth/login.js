const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) return error('Username and password are required', 400);

    const admin = await Admin.findOne({ username });
    if (!admin) return error('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return error('Invalid credentials', 401);

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return success({ token, username: admin.username, message: 'Login successful' });
  } catch (err) {
    return error(err.message);
  }
};
