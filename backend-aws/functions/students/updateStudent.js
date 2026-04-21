const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Student = require('../../models/Student');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { id } = event.pathParameters;
    const body = JSON.parse(event.body || '{}');

    if (body.rollNo) {
      const duplicate = await Student.findOne({ rollNo: body.rollNo, _id: { $ne: id } });
      if (duplicate) return error('Roll number already in use', 400);
    }

    const student = await Student.findByIdAndUpdate(id, body, { new: true, runValidators: false });
    if (!student) return error('Student not found', 404);

    return success(student);
  } catch (err) {
    return error(err.message);
  }
};
