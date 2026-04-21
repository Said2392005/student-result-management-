const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      principalId: decoded.id,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
      context: {
        adminId: decoded.id,
      },
    };
  } catch (err) {
    throw new Error('Unauthorized');
  }
};
