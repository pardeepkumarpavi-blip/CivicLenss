import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Department from '../models/Department.js';
import AuthorityInvitation from '../models/AuthorityInvitation.js';
import {
  ROLES,
  AUTHORITY_ROLES,
  REPORT_STATUS,
  VALID_STATUS_TRANSITIONS,
  ROLE_DEFAULT_PERMISSIONS
} from '../config/constants.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokenUtils.js';
import { uploadMedia } from '../services/storageService.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const authorityLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Official email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .populate('departmentId', 'name code city jurisdiction');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid official credentials.'
      });
    }

    if (!AUTHORITY_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: This portal is reserved exclusively for authorized municipal personnel. Citizens should use the Citizen Portal.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid official credentials.'
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Authority access suspended. Contact the Municipal Super Administrator.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await logAuditEvent({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'AUTHORITY_LOGIN',
      targetType: 'User',
      targetId: user._id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Authority authenticated successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.departmentId,
        designation: user.designation,
        employeeId: user.employeeId,
        permissions: user.permissions,
        city: user.city,
        accountStatus: user.accountStatus,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token and password are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const tokenHash = hashToken(token);
    const invitation = await AuthorityInvitation.findOne({
      tokenHash,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, already used, or revoked invitation token.'
      });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired. Request a new invitation from your administrator.'
      });
    }

    // Check if user account with this email already exists
    let existingUser = await User.findOne({ email: invitation.officialEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An active account is already registered for this official email.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[invitation.role] || [];
    const assignedPermissions = invitation.permissions && invitation.permissions.length > 0
      ? invitation.permissions
      : defaultPermissions;

    const newAuthority = new User({
      name: invitation.officialName,
      email: invitation.officialEmail,
      passwordHash,
      role: invitation.role,
      departmentId: invitation.departmentId,
      designation: invitation.designation,
      employeeId: invitation.employeeId,
      permissions: assignedPermissions,
      accountStatus: 'active',
      verificationStatus: 'verified',
      createdBy: invitation.invitedBy
    });

    await newAuthority.save();

    // Mark invitation accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    await logAuditEvent({
      actorId: newAuthority._id,
      actorName: newAuthority.name,
      actorRole: newAuthority.role,
      action: 'AUTHORITY_INVITATION_ACCEPTED',
      targetType: 'AuthorityInvitation',
      targetId: invitation._id,
      newValue: { userId: newAuthority._id, email: newAuthority.email, role: newAuthority.role },
      req
    });

    const accessToken = generateAccessToken(newAuthority);
    const refreshToken = generateRefreshToken(newAuthority);

    return res.status(201).json({
      success: true,
      message: 'Official authority account activated successfully. Welcome to the CivicLens Municipal Portal.',
      accessToken,
      refreshToken,
      user: {
        id: newAuthority._id,
        name: newAuthority.name,
        email: newAuthority.email,
        role: newAuthority.role,
        department: newAuthority.departmentId,
        designation: newAuthority.designation,
        employeeId: newAuthority.employeeId,
        permissions: newAuthority.permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorityDashboard = async (req, res, next) => {
  try {
    const isGlobalAdmin = req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.MUNICIPAL_ADMIN;
    const filter = {};

    if (!isGlobalAdmin && req.user.departmentId) {
      filter.assignedDepartment = req.user.departmentId;
    }

    const [
      totalCount,
      submittedCount,
      underReviewCount,
      assignedCount,
      inProgressCount,
      awaitingVerificationCount,
      resolvedCount,
      reopenedCount,
      recentReports
    ] = await Promise.all([
      Report.countDocuments(filter),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.SUBMITTED }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.UNDER_REVIEW }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.ASSIGNED }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.IN_PROGRESS }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.AWAITING_VERIFICATION }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.RESOLVED }),
      Report.countDocuments({ ...filter, status: REPORT_STATUS.REOPENED }),
      Report.find(filter)
        .populate('assignedDepartment', 'name code')
        .populate('citizenId', 'name city')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        submitted: submittedCount,
        underReview: underReviewCount,
        assigned: assignedCount,
        inProgress: inProgressCount,
        awaitingVerification: awaitingVerificationCount,
        resolved: resolvedCount,
        reopened: reopenedCount
      },
      recentReports
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorityReports = async (req, res, next) => {
  try {
    const { status, category, severity, area, search, page = 1, limit = 15 } = req.query;
    const isGlobalAdmin = req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.MUNICIPAL_ADMIN;

    const query = {};

    if (!isGlobalAdmin && req.user.departmentId) {
      query.assignedDepartment = req.user.departmentId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.issueCategory = category;
    }

    if (severity && severity !== 'all') {
      query.severitySuggestion = severity;
    }

    if (area && area !== 'all') {
      query.area = new RegExp(area.trim(), 'i');
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { referenceId: new RegExp(s, 'i') },
        { description: new RegExp(s, 'i') },
        { locationAddress: new RegExp(s, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .populate('assignedDepartment', 'name code')
        .populate('assignedAuthorityId', 'name designation')
        .populate('citizenId', 'name email city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      reports,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus, explanation } = req.body;

    if (!newStatus || !explanation) {
      return res.status(400).json({
        success: false,
        message: 'Both status and explanation are mandatory for municipal status transitions.'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    // Department isolation check for non-global admins
    const isGlobalAdmin = req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.MUNICIPAL_ADMIN;
    if (!isGlobalAdmin && report.assignedDepartment && req.user.departmentId) {
      if (String(report.assignedDepartment) !== String(req.user.departmentId)) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted: Complaint is assigned to a different municipal department.'
        });
      }
    }

    const currentStatus = report.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    // Allow re-updating within valid transitions, or allow Super Admin exceptional override
    if (!allowedTransitions.includes(newStatus) && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: Cannot change status from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(', ') || 'None'}`
      });
    }

    report.status = newStatus;
    report.statusHistory.push({
      previousStatus: currentStatus,
      newStatus,
      changedBy: req.user._id,
      changedByName: req.user.name,
      role: req.user.role,
      explanation: explanation.trim(),
      timestamp: new Date()
    });

    await report.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REPORT_STATUS_TRANSITION',
      targetType: 'Report',
      targetId: report._id,
      previousValue: { status: currentStatus },
      newValue: { status: newStatus, explanation },
      req
    });

    // Notify the citizen
    await createNotification({
      userId: report.citizenId,
      title: `Complaint Status Updated: ${report.referenceId}`,
      message: `Your complaint ${report.referenceId} has been moved to "${newStatus}". Note: ${explanation}`,
      type: 'status_updated',
      reportId: report._id,
      reportReferenceId: report.referenceId
    });

    return res.status(200).json({
      success: true,
      message: `Status successfully updated to ${newStatus}`,
      report
    });
  } catch (error) {
    next(error);
  }
};

export const assignReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, authorityId, notes } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required for municipal routing.'
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Target department does not exist.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    const prevDept = report.assignedDepartment;
    report.assignedDepartment = department._id;

    if (authorityId) {
      const officer = await User.findById(authorityId);
      if (officer && AUTHORITY_ROLES.includes(officer.role)) {
        report.assignedAuthorityId = officer._id;
      }
    }

    // Automatically transition to Assigned if in initial submission phase
    const previousStatus = report.status;
    if (report.status === REPORT_STATUS.SUBMITTED || report.status === REPORT_STATUS.UNDER_REVIEW) {
      report.status = REPORT_STATUS.ASSIGNED;
      report.statusHistory.push({
        previousStatus,
        newStatus: REPORT_STATUS.ASSIGNED,
        changedBy: req.user._id,
        changedByName: req.user.name,
        role: req.user.role,
        explanation: notes || `Assigned to ${department.name}`,
        timestamp: new Date()
      });
    }

    await report.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REPORT_ASSIGNED_DEPARTMENT',
      targetType: 'Report',
      targetId: report._id,
      previousValue: { departmentId: prevDept },
      newValue: { departmentId: department._id, authorityId: report.assignedAuthorityId },
      req
    });

    await createNotification({
      userId: report.citizenId,
      title: `Complaint Assigned: ${report.referenceId}`,
      message: `Your complaint has been officially routed to ${department.name}.`,
      type: 'assigned',
      reportId: report._id,
      reportReferenceId: report.referenceId
    });

    return res.status(200).json({
      success: true,
      message: `Report assigned to ${department.name}`,
      report
    });
  } catch (error) {
    next(error);
  }
};

export const addProgressNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, isInternal = false } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    const newNote = {
      authorId: req.user._id,
      authorName: req.user.name,
      role: req.user.role,
      isInternal: Boolean(isInternal),
      note: note.trim(),
      timestamp: new Date()
    };

    report.progressNotes.push(newNote);
    await report.save();

    // If not marked internal, notify the citizen
    if (!isInternal) {
      await createNotification({
        userId: report.citizenId,
        title: `Official Note Added: ${report.referenceId}`,
        message: `${req.user.name} (${req.user.designation || 'Authority Officer'}): "${note.trim()}"`,
        type: 'status_updated',
        reportId: report._id,
        reportReferenceId: report.referenceId
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Progress note added successfully',
      progressNotes: report.progressNotes
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResolutionEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    let resolutionImageUrl = null;
    if (req.file) {
      const uploadResult = await uploadMedia(req.file);
      resolutionImageUrl = uploadResult.url;
    }

    report.resolutionEvidence = {
      imageUrl: resolutionImageUrl || report.resolutionEvidence?.imageUrl || null,
      description: description ? description.trim() : 'Resolution work completed.',
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      resolvedByName: req.user.name
    };

    const previousStatus = report.status;
    report.status = REPORT_STATUS.AWAITING_VERIFICATION;
    report.citizenVerification = {
      status: 'Pending',
      verifiedAt: null,
      citizenFeedback: null
    };

    report.statusHistory.push({
      previousStatus,
      newStatus: REPORT_STATUS.AWAITING_VERIFICATION,
      changedBy: req.user._id,
      changedByName: req.user.name,
      role: req.user.role,
      explanation: `Resolution evidence submitted by ${req.user.name}. Awaiting citizen verification.`,
      timestamp: new Date()
    });

    await report.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'RESOLUTION_EVIDENCE_SUBMITTED',
      targetType: 'Report',
      targetId: report._id,
      newValue: {
        evidenceDescription: description,
        status: REPORT_STATUS.AWAITING_VERIFICATION
      },
      req
    });

    // Notify citizen to verify resolution
    await createNotification({
      userId: report.citizenId,
      title: `Action Completed — Verification Requested: ${report.referenceId}`,
      message: `Municipal officers have marked your complaint as resolved with completion evidence. Please inspect and confirm the outcome.`,
      type: 'verification_requested',
      reportId: report._id,
      reportReferenceId: report.referenceId
    });

    return res.status(200).json({
      success: true,
      message: 'Resolution evidence uploaded. Complaint transitioned to Awaiting Verification.',
      report
    });
  } catch (error) {
    next(error);
  }
};
