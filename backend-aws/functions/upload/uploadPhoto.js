const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Upload event received, httpMethod:', event.httpMethod);
    console.log('S3_BUCKET env:', process.env.S3_BUCKET);

    const body = JSON.parse(event.body || '{}');
    const { fileData, fileType, studentId } = body;

    if (!fileData) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'No file data provided' }) };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (fileType && !allowedTypes.includes(fileType)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Only JPEG, PNG and WebP allowed' }) };
    }

    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 2 * 1024 * 1024) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'File size must be under 2MB' }) };
    }

    const ext = fileType ? fileType.split('/')[1] : 'jpg';
    const key = `photos/${studentId ? studentId + '_' : ''}${uuidv4()}.${ext}`;

    const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'ap-south-1' });

    console.log('Uploading to bucket:', process.env.S3_BUCKET, 'key:', key);

    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: fileType || 'image/jpeg',
    }).promise();

    const photoUrl = `https://${process.env.S3_BUCKET}.s3.ap-south-1.amazonaws.com/${key}`;
    console.log('Upload success, photoUrl:', photoUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        photoUrl,
        key,
        bucket: process.env.S3_BUCKET,
        message: 'Photo uploaded to S3 successfully',
      }),
    };
  } catch (err) {
    console.error('Upload error:', err.message, err.code);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Upload failed: ' + err.message, error: err.code }),
    };
  }
};
