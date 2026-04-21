const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Student = require('../../models/Student');
const Result = require('../../models/Result');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const { id } = event.pathParameters;
    const student = await Student.findById(id);
    if (!student) return error('Student not found', 404);

    if (student.photoUrl) {
      const key = student.photoUrl.split('.amazonaws.com/')[1];
      if (key) {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
      }
    }

    await Student.findByIdAndDelete(id);
    await Result.deleteMany({ student: id });

    return success({ message: 'Student deleted ✅' });
  } catch (err) {
    return error(err.message);
  }
};
