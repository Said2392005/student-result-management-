const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Wildcard resource so the cached policy covers all endpoints,
    // not just the one that triggered the first authorizer invocation.
    const arnBase = event.methodArn.split('/').slice(0, 2).join('/');

    return {
      principalId: decoded.id,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: `${arnBase}/*`,
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
