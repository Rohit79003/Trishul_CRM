const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trishul_jwt_secret_key_2026');
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
