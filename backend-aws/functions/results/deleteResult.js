const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Result = require('../../models/Result');

module.exports.handler = async (event) => {
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
