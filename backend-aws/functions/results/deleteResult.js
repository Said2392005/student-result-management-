const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Result = require('../../models/Result');

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { id } = event.pathParameters;
    const result = await Result.findByIdAndDelete(id);
    if (!result) return error('Result not found', 404);

    return success({ message: 'Result deleted ✅' });
  } catch (err) {
    return error(err.message);
  }
};
