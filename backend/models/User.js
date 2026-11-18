import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, AUTHORITY_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // never returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    designation: {
      type: String,
      trim: true,
      default: null
    },
    employeeId: {
      type: String,
      trim: true,
      default: null
    },
    permissions: {
      type: [String],
      default: []
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification'],
      default: 'active'
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified', 'pending'],
      default: 'unverified'
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'ur'],
      default: 'en'
    },
    city: {
      type: String,
      trim: true,
      default: 'Karachi'
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password against hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Virtual helper to check if user is authority
userSchema.virtual('isAuthority').get(function () {
  return AUTHORITY_ROLES.includes(this.role);
});

// JSON serialization transform to exclude sensitive properties
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
