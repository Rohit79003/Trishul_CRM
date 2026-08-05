module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized. User role missing.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Action requires one of the following roles: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};
