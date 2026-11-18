import User from '../models/User.js';
import Department from '../models/Department.js';
import Report from '../models/Report.js';
import AuthorityInvitation from '../models/AuthorityInvitation.js';
import AuditLog from '../models/AuditLog.js';
import { ROLES, AUTHORITY_ROLES, ROLE_DEFAULT_PERMISSIONS } from '../config/constants.js';
import { generateSecureToken } from '../utils/tokenUtils.js';
import { logAuditEvent } from '../services/auditService.js';
import { isGeminiConfigured } from '../services/geminiService.js';
import mongoose from 'mongoose';

export const createAuthorityInvitation = async (req, res, next) => {
  try {
    const { officialName, officialEmail, organization, departmentId, designation, employeeId, role, permissions } = req.body;

    if (!officialName || !officialEmail || !organization || !departmentId || !designation || !role) {
      return res.status(400).json({
        success: false,
        message: 'All invitation fields (Name, Email, Organization, Department, Designation, Role) are mandatory.'
      });
    }

    if (!AUTHORITY_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid authority role designated.'
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Designated department does not exist.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: officialEmail.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account is already active with this official email.'
      });
    }

    // Check if an active invitation exists
    const existingInvitation = await AuthorityInvitation.findOne({
      officialEmail: officialEmail.toLowerCase().trim(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'A pending invitation already exists for this email address. Revoke it before issuing a new one.'
      });
    }

    const { plainToken, tokenHash } = generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day expiration

    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role] || [];
    const finalPermissions = Array.isArray(permissions) && permissions.length > 0 ? permissions : defaultPerms;

    const invitation = new AuthorityInvitation({
      officialName: officialName.trim(),
      officialEmail: officialEmail.toLowerCase().trim(),
      organization: organization.trim(),
      departmentId: department._id,
      designation: designation.trim(),
      employeeId: employeeId ? employeeId.trim() : null,
      role,
      permissions: finalPermissions,
      tokenHash,
      expiresAt,
      invitedBy: req.user._id,
      status: 'pending'
    });

    await invitation.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'AUTHORITY_INVITATION_CREATED',
      targetType: 'AuthorityInvitation',
      targetId: invitation._id,
      newValue: {
        officialEmail: invitation.officialEmail,
        department: department.name,
        role: invitation.role
      },
      req
    });

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/authority/invitation?token=${plainToken}`;

    return res.status(201).json({
      success: true,
      message: 'Authority invitation created successfully. Deliver the secure invitation link to the verified official.',
      invitation: {
        id: invitation._id,
        officialName: invitation.officialName,
        officialEmail: invitation.officialEmail,
        organization: invitation.organization,
        department: department.name,
        designation: invitation.designation,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: invitation.status
      },
      token: plainToken,
      inviteLink
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorityInvitations = async (req, res, next) => {
  try {
    const invitations = await AuthorityInvitation.find()
      .populate('departmentId', 'name code')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      invitations
    });
  } catch (error) {
    next(error);
  }
};

export const revokeAuthorityInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await AuthorityInvitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    invitation.status = 'revoked';
    await invitation.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'AUTHORITY_INVITATION_REVOKED',
      targetType: 'AuthorityInvitation',
      targetId: invitation._id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Authority invitation successfully revoked.'
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorities = async (req, res, next) => {
  try {
    const { departmentId, role, status } = req.query;
    const query = { role: { $in: AUTHORITY_ROLES } };

    if (departmentId && departmentId !== 'all') {
      query.departmentId = departmentId;
    }
    if (role && role !== 'all') {
      query.role = role;
    }
    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    const authorities = await User.find(query)
      .populate('departmentId', 'name code city jurisdiction')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      authorities
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus, permissions, designation, departmentId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Authority user not found.' });
    }

    // Prevent modifying Super Admin account status by non-self
    if (user.role === ROLES.SUPER_ADMIN && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify primary Super Administrator account.'
      });
    }

    const prevValues = {
      accountStatus: user.accountStatus,
      permissions: user.permissions,
      designation: user.designation,
      departmentId: user.departmentId
    };

    if (accountStatus) user.accountStatus = accountStatus;
    if (Array.isArray(permissions)) user.permissions = permissions;
    if (designation) user.designation = designation.trim();
    if (departmentId) user.departmentId = departmentId;

    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'AUTHORITY_RECORD_UPDATED',
      targetType: 'User',
      targetId: user._id,
      previousValue: prevValues,
      newValue: {
        accountStatus: user.accountStatus,
        permissions: user.permissions,
        designation: user.designation,
        departmentId: user.departmentId
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Authority account updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'all') {
      query.action = action;
    }
    if (targetType && targetType !== 'all') {
      query.targetType = targetType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    const [
      totalUsers,
      totalCitizens,
      totalAuthorities,
      totalDepartments,
      totalReports,
      pendingInvitations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CITIZEN }),
      User.countDocuments({ role: { $in: AUTHORITY_ROLES } }),
      Department.countDocuments(),
      Report.countDocuments(),
      AuthorityInvitation.countDocuments({ status: 'pending' })
    ]);

    return res.status(200).json({
      success: true,
      health: {
        status: dbState === 1 ? 'operational' : 'degraded',
        database: {
          status: dbStatusMap[dbState] || 'Unknown',
          host: mongoose.connection.host,
          databaseName: mongoose.connection.name
        },
        services: {
          geminiAI: isGeminiConfigured() ? 'Available' : 'Unconfigured (Manual reporting active)',
          storage: process.env.CLOUDINARY_API_KEY ? 'Cloudinary Production CDN' : 'Local Storage Engine'
        },
        counts: {
          totalUsers,
          citizens: totalCitizens,
          authorities: totalAuthorities,
          departments: totalDepartments,
          reports: totalReports,
          pendingInvitations
        },
        systemTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime())
      }
    });
  } catch (error) {
    next(error);
  }
};
