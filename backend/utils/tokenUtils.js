import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'civiclens-dev-access-secret-38947239847239847';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'civiclens-dev-refresh-secret-89237498237498237';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || null,
      permissions: user.permissions || []
    },
    ACCESS_SECRET,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

export const generateSecureToken = () => {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  return { plainToken, tokenHash };
};

export const hashToken = (plainToken) => {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
};
