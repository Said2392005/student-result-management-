const { success, error } = require('../../utils/response');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    const { fileData, fileType, studentId } = JSON.parse(event.body || '{}');

    if (!fileData || !fileType) return error('fileData and fileType are required', 400);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return error('Only JPEG, PNG and WebP images are allowed', 400);
    }

    const base64 = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    if (buffer.length > 2 * 1024 * 1024) {
      return error('File size must be under 2MB', 400);
    }

    const ext = fileType.split('/')[1];
    const key = `photos/${studentId ? studentId + '_' : ''}${uuidv4()}.${ext}`;

    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: fileType,
      })
      .promise();

    const photoUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
    return success({ photoUrl, key });
  } catch (err) {
    return error(err.message);
  }
};
