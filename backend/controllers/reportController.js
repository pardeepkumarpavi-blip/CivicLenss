import Report from '../models/Report.js';
import ComplaintCounter from '../models/ComplaintCounter.js';
import Department from '../models/Department.js';
import { REPORT_STATUS, ISSUE_CATEGORIES, SEVERITY_LEVELS, AUTHORITY_ROLES } from '../config/constants.js';
import { uploadMedia } from '../services/storageService.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { findPotentialDuplicates } from '../services/duplicateDetectionService.js';

export const createReport = async (req, res, next) => {
  try {
    const {
      description,
      issueCategory,
      locationAddress,
      city,
      area,
      latitude,
      longitude,
      severitySuggestion,
      aiAnalysis
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photographic evidence is required to register a civic complaint.'
      });
    }

    if (!description || !issueCategory || !locationAddress || !area) {
      return res.status(400).json({
        success: false,
        message: 'Description, issue category, address, and area neighborhood are mandatory fields.'
      });
    }

    if (!ISSUE_CATEGORIES.includes(issueCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid issue category. Allowed: ${ISSUE_CATEGORIES.join(', ')}`
      });
    }

    // Process photographic evidence
    const uploadResult = await uploadMedia(req.file);

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const hasExactCoordinates = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    // Karachi fallback coordinates if not supplied [lng, lat]
    const coordinates = hasExactCoordinates ? [lng, lat] : [67.0011, 24.8607];

    // Atomic complaint sequence reference generation: e.g. CL-2026-00001
    const referenceId = await ComplaintCounter.getNextSequence(new Date().getFullYear());

    // Check for potential duplicate complaints in close physical proximity
    let duplicates = [];
    if (hasExactCoordinates) {
      duplicates = await findPotentialDuplicates({
        longitude: lng,
        latitude: lat,
        issueCategory,
        description,
        maxDistanceMeters: 300
      });
    }

    // Parse AI Analysis if present
    let parsedAi = {};
    if (aiAnalysis) {
      try {
        parsedAi = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
      } catch {
        parsedAi = {};
      }
    }

    const report = new Report({
      referenceId,
      citizenId: req.user._id,
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
      description: description.trim(),
      issueCategory,
      locationAddress: locationAddress.trim(),
      city: city ? city.trim() : 'Karachi',
      area: area.trim(),
      location: {
        type: 'Point',
        coordinates
      },
      hasExactCoordinates,
      visibility: 'public',
      severitySuggestion: SEVERITY_LEVELS.includes(severitySuggestion) ? severitySuggestion : 'Unknown',
      aiAnalysis: {
        issueCategory: parsedAi.issueCategory || issueCategory,
        issueDescription: parsedAi.issueDescription || null,
        severitySuggestion: parsedAi.severitySuggestion || 'Unknown',
        recommendedDepartment: parsedAi.recommendedDepartment || null,
        suggestedAction: parsedAi.suggestedAction || null,
        confidence: parsedAi.confidence || 0,
        requiresHumanReview: true,
        rawAnalysis: parsedAi.rawAnalysis || null,
        analyzedAt: parsedAi.analyzedAt || new Date()
      },
      status: REPORT_STATUS.SUBMITTED,
      statusHistory: [
        {
          previousStatus: null,
          newStatus: REPORT_STATUS.SUBMITTED,
          changedBy: req.user._id,
          changedByName: req.user.name,
          role: req.user.role,
          explanation: 'Complaint successfully lodged in CivicLens platform.',
          timestamp: new Date()
        }
      ],
      potentialDuplicates: duplicates
    });

    await report.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REPORT_SUBMITTED',
      targetType: 'Report',
      targetId: report._id,
      newValue: { referenceId: report.referenceId, category: report.issueCategory, area: report.area },
      req
    });

    await createNotification({
      userId: req.user._id,
      title: `Complaint Lodged: ${report.referenceId}`,
      message: `Your complaint has been registered with reference ${report.referenceId}. Municipal authorities will review it shortly.`,
      type: 'report_submitted',
      reportId: report._id,
      reportReferenceId: report.referenceId
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully.',
      referenceId: report.referenceId,
      report,
      potentialDuplicates: duplicates
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { citizenId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('assignedDepartment', 'name code')
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

export const getPublicReports = async (req, res, next) => {
  try {
    const { category, status, severity, area, search, limit = 100 } = req.query;
    const query = { visibility: 'public' };

    if (category && category !== 'all') {
      query.issueCategory = category;
    }
    if (status && status !== 'all') {
      query.status = status;
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

    // Return sanitized fields for public safety (no citizen emails/phones/private notes)
    const reports = await Report.find(query)
      .select('referenceId imageUrl description issueCategory locationAddress city area location hasExactCoordinates severitySuggestion status createdAt resolutionEvidence assignedDepartment')
      .populate('assignedDepartment', 'name code')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by MongoDB ObjectId or human-readable referenceId (CL-2026-XXXXX)
    let query = {};
    if (id.startsWith('CL-')) {
      query = { referenceId: id };
    } else {
      query = { _id: id };
    }

    const report = await Report.findOne(query)
      .populate('citizenId', 'name city')
      .populate('assignedDepartment', 'name code city jurisdiction contactEmail')
      .populate('assignedAuthorityId', 'name designation')
      .populate('potentialDuplicates.reportId', 'referenceId description issueCategory status');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    const isAuthority = req.user && AUTHORITY_ROLES.includes(req.user.role);
    const isOwner = req.user && String(req.user._id) === String(report.citizenId._id);

    // If caller is neither authority nor owner, filter out internal notes
    let filteredNotes = report.progressNotes;
    if (!isAuthority) {
      filteredNotes = report.progressNotes.filter((note) => !note.isInternal);
    }

    const responseObj = report.toObject();
    responseObj.progressNotes = filteredNotes;

    // For public visitors who aren't the owner or an authority, sanitize citizen data
    if (!isAuthority && !isOwner) {
      if (responseObj.citizenId) {
        responseObj.citizenId = {
          name: responseObj.citizenId.name ? `${responseObj.citizenId.name.charAt(0)}***` : 'Citizen',
          city: responseObj.citizenId.city
        };
      }
    }

    return res.status(200).json({
      success: true,
      report: responseObj
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResolution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmed, feedback } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    // Only citizen owner can verify resolution
    if (String(report.citizenId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the citizen who lodged this complaint can verify its resolution.'
      });
    }

    if (report.status !== REPORT_STATUS.AWAITING_VERIFICATION && report.status !== REPORT_STATUS.RESOLVED) {
      return res.status(400).json({
        success: false,
        message: 'Complaint is not currently awaiting verification.'
      });
    }

    const previousStatus = report.status;
    let newStatus = REPORT_STATUS.RESOLVED;
    let statusExplanation = '';

    if (confirmed === true) {
      report.citizenVerification = {
        status: 'Confirmed Resolved',
        verifiedAt: new Date(),
        citizenFeedback: feedback ? feedback.trim() : 'Citizen confirmed issue resolution.'
      };
      newStatus = REPORT_STATUS.RESOLVED;
      statusExplanation = 'Citizen confirmed issue has been satisfactorily resolved on the ground.';
    } else {
      report.citizenVerification = {
        status: 'Issue Still Exists',
        verifiedAt: new Date(),
        citizenFeedback: feedback ? feedback.trim() : 'Citizen reported the issue remains unaddressed or unresolved.'
      };
      newStatus = REPORT_STATUS.REOPENED;
      statusExplanation = `Citizen reported issue still exists: "${feedback || 'No detailed feedback provided'}"`;
    }

    report.status = newStatus;
    report.statusHistory.push({
      previousStatus,
      newStatus,
      changedBy: req.user._id,
      changedByName: req.user.name,
      role: req.user.role,
      explanation: statusExplanation,
      timestamp: new Date()
    });

    await report.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: confirmed ? 'CITIZEN_CONFIRMED_RESOLUTION' : 'CITIZEN_REJECTED_RESOLUTION',
      targetType: 'Report',
      targetId: report._id,
      newValue: { status: newStatus, verificationStatus: report.citizenVerification.status },
      req
    });

    return res.status(200).json({
      success: true,
      message: confirmed ? 'Resolution verified and confirmed. Thank you for making our city better!' : 'Feedback noted. Complaint has been reopened for municipal review.',
      report
    });
  } catch (error) {
    next(error);
  }
};

export const reopenReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { explanation } = req.body;

    if (!explanation || !explanation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'An explanation is required to reopen a closed or resolved complaint.'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Complaint report not found.' });
    }

    const isOwner = String(report.citizenId) === String(req.user._id);
    const isAuthority = AUTHORITY_ROLES.includes(req.user.role);

    if (!isOwner && !isAuthority) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reopen this complaint.' });
    }

    const previousStatus = report.status;
    report.status = REPORT_STATUS.REOPENED;
    report.statusHistory.push({
      previousStatus,
      newStatus: REPORT_STATUS.REOPENED,
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
      action: 'REPORT_REOPENED',
      targetType: 'Report',
      targetId: report._id,
      newValue: { explanation: explanation.trim() },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint has been reopened.',
      report
    });
  } catch (error) {
    next(error);
  }
};
