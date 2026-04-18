const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Result = require('../../models/Result');
require('../../models/Student');

module.exports.handler = async (event) => {
  try {
    await connectDB();

    const { id } = event.pathParameters;
    const data = JSON.parse(event.body || '{}');
    const { subjects } = data;

    if (subjects?.length) {
      const totalMarks = subjects.reduce((sum, s) => sum + Number(s.marks), 0);
      const maxTotalMarks = subjects.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
      data.totalMarks = totalMarks;
      data.maxTotalMarks = maxTotalMarks;
      data.percentage = parseFloat(((totalMarks / maxTotalMarks) * 100).toFixed(2));
      data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    }

    const result = await Result.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('student', 'name rollNo department year email');

    if (!result) return error('Result not found', 404);
    return success(result);
  } catch (err) {
    return error(err.message);
  }
};
