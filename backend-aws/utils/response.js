const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

module.exports = {
  headers,
  success: (data, statusCode = 200) => ({
    statusCode,
    headers,
    body: JSON.stringify(data),
  }),
  error: (message, statusCode = 500) => ({
    statusCode,
    headers,
    body: JSON.stringify({ message }),
  }),
};
