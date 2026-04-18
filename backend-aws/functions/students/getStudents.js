const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Student = require('../../models/Student');

module.exports.handler = async (event) => {
  try {
    await connectDB();

    const { search, department, year } = event.queryStringParameters || {};
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { rollNo: new RegExp(search, 'i') },
      ];
    }
    if (department) query.department = department;
    if (year) query.year = year;

    const students = await Student.find(query).sort({ createdAt: -1 });
    return success(students);
  } catch (err) {
    return error(err.message);
  }
};
