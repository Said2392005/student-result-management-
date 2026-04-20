const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Student = require('../../models/Student');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const body = JSON.parse(event.body || '{}');
    const { name, rollNo, department, year, email } = body;

    if (!name || !rollNo || !department || !year) {
      return error('name, rollNo, department and year are required', 400);
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) return error('Roll number already exists', 400);

    const student = await Student.create({ name, rollNo, department, year, email });
    return success(student, 201);
  } catch (err) {
    return error(err.message);
  }
};
