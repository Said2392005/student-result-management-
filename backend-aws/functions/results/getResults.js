const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Result = require('../../models/Result');
require('../../models/Student');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { semester, status, search } = event.queryStringParameters || {};
    const query = {};

    if (semester) query.semester = semester;
    if (status) query.status = status;

    let results = await Result.find(query)
      .populate('student', 'name rollNo department year email')
      .sort({ createdAt: -1 });

    if (search) {
      const re = new RegExp(search, 'i');
      results = results.filter(
        (r) => r.student?.name?.match(re) || r.student?.rollNo?.match(re)
      );
    }

    return success(results);
  } catch (err) {
    return error(err.message);
  }
};
