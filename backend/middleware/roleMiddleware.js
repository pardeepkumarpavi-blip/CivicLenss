import { ROLES, AUTHORITY_ROLES } from '../config/constants.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient operational privileges for this role.'
      });
    }

    next();
  };
};

export const requireAuthority = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!AUTHORITY_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Municipal authority privileges required.'
    });
  }

  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Super Administrator clearance required.'
    });
  }

  next();
};

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin has all privileges implicitly
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing required permission(s): ${requiredPermissions.join(', ')}`
      });
    }

    next();
  };
};

export const requireDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Super Admin & Municipal Admin have global municipal oversight
  if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.MUNICIPAL_ADMIN) {
    return next();
  }

  // If a specific departmentId is targeted in request params or body
  const targetDepartmentId = req.params.departmentId || req.body.departmentId || req.query.departmentId;

  if (targetDepartmentId && req.user.departmentId) {
    if (String(req.user.departmentId) !== String(targetDepartmentId)) {
      return res.status(403).json({
        success: false,
        message: 'Department isolation: You are not authorized to perform actions outside your assigned department.'
      });
    }
  }

  next();
};
