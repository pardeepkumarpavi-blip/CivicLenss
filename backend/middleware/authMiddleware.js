import { verifyAccessToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in to access this resource.'
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please sign in again.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this session no longer exists.'
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by municipal administrators. Contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication processing error',
      error: error.message
    });
  }
};

// Optional authentication middleware: if token is present, sets req.user; otherwise proceeds as anonymous
export const optionalAuthenticateToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.accountStatus !== 'suspended') {
          req.user = user;
        }
      } catch {
        // Token invalid, proceed anonymously
      }
    }
    next();
  } catch {
    next();
  }
};
