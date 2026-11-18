import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { generateAccessToken, generateRefreshToken, generateSecureToken, hashToken } from '../utils/tokenUtils.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const registerCitizen = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, city, phoneNumber, preferredLanguage } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirmation password do not match.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // CRITICAL SECURITY ENFORCEMENT:
    // ALWAYS force role to citizen. Even if role is provided in request body, it is strictly ignored.
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: ROLES.CITIZEN,
      city: city ? city.trim() : 'Karachi',
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      preferredLanguage: preferredLanguage || 'en',
      accountStatus: 'active',
      verificationStatus: 'unverified'
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await logAuditEvent({
      actorId: newUser._id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'CITIZEN_REGISTRATION',
      targetType: 'User',
      targetId: newUser._id,
      req
    });

    await createNotification({
      userId: newUser._id,
      title: 'Welcome to CivicLens AI',
      message: 'Your citizen account has been successfully created. You can now submit and track municipal complaints.',
      type: 'system_alert'
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        city: newUser.city,
        preferredLanguage: newUser.preferredLanguage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .populate('departmentId', 'name code city jurisdiction');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by municipal administrators. Contact authority support.'
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
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
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
        preferredLanguage: user.preferredLanguage,
        accountStatus: user.accountStatus,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('departmentId', 'name code city jurisdiction')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditEvent({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'USER_LOGOUT',
        targetType: 'User',
        targetId: req.user._id,
        req
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not disclose whether email exists for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been dispatched.'
      });
    }

    const { plainToken, tokenHash } = generateSecureToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    await logAuditEvent({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'User',
      targetId: user._id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been dispatched.',
      // In development / demo when email server is not configured, we return reset token metadata
      resetToken: process.env.NODE_ENV !== 'production' ? plainToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();

    await logAuditEvent({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      targetType: 'User',
      targetId: user._id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
