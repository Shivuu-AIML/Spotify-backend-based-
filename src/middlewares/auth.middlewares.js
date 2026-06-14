const jwt = require('jsonwebtoken');

/**
 * Middleware to require authentication via JWT stored in cookies as `token`.
 * Assumes JWT payload shape includes:
 * - userId (string/ObjectId)
 * - role (string: 'artist' | 'user' | ...)
 */
function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach useful fields to request
    req.userId = decoded.userId;
    req.role = decoded.role;

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function authUser(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.role !== 'user') {
      return res.status(403).json({ message: "You dont have access" });
    }
    return next();
  });
}

/**
 * Middleware to require role authorization.
 * Usage: router.post('/x', authMiddleware, requireRole('artist'), handler)
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.role !== role) {
      return res.status(403).json({ message: "You dont have access" });
    }
    return next();
  };
}

module.exports = {
  authMiddleware,
  authUser,
  requireRole,
};
