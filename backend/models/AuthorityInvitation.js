import mongoose from 'mongoose';
import { AUTHORITY_ROLES } from '../config/constants.js';

const authorityInvitationSchema = new mongoose.Schema(
  {
    officialName: {
      type: String,
      required: [true, 'Official name is required'],
      trim: true
    },
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    designation: {
      type: String,
      required: [true, 'Official designation is required'],
      trim: true
    },
    employeeId: {
      type: String,
      trim: true,
      default: null
    },
    role: {
      type: String,
      enum: AUTHORITY_ROLES,
      required: [true, 'Authority role is required']
    },
    permissions: {
      type: [String],
      default: []
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

authorityInvitationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.tokenHash;
    delete ret.__v;
    return ret;
  }
});

const AuthorityInvitation = mongoose.model('AuthorityInvitation', authorityInvitationSchema);
export default AuthorityInvitation;
