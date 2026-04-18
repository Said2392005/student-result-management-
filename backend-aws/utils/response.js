const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};

module.exports = {
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
