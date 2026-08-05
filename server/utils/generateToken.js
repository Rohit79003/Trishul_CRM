const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'trishul_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
