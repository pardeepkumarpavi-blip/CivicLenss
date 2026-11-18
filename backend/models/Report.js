import mongoose from 'mongoose';
import { ISSUE_CATEGORIES, REPORT_STATUS, SEVERITY_LEVELS } from '../config/constants.js';

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      enum: Object.values(REPORT_STATUS)
    },
    newStatus: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedByName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const progressNoteSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const resolutionEvidenceSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedByName: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const citizenVerificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'Confirmed Resolved', 'Issue Still Exists'],
      default: 'Pending'
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    citizenFeedback: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: false }
);

const potentialDuplicateSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true
    },
    referenceId: {
      type: String,
      required: true
    },
    similarityScore: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Report photo is required']
    },
    imagePublicId: {
      type: String,
      default: null
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    issueCategory: {
      type: String,
      enum: ISSUE_CATEGORIES,
      required: [true, 'Issue category is required'],
      index: true
    },
    locationAddress: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: 'Karachi'
    },
    area: {
      type: String,
      required: [true, 'Area or neighborhood is required'],
      trim: true,
      index: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    hasExactCoordinates: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal_only'],
      default: 'public',
      index: true
    },
    severitySuggestion: {
      type: String,
      enum: SEVERITY_LEVELS,
      default: 'Unknown'
    },
    aiAnalysis: {
      issueCategory: { type: String, default: null },
      issueDescription: { type: String, default: null },
      severitySuggestion: { type: String, default: 'Unknown' },
      recommendedDepartment: { type: String, default: null },
      suggestedAction: { type: String, default: null },
      confidence: { type: Number, default: 0 },
      requiresHumanReview: { type: Boolean, default: true },
      rawAnalysis: { type: String, default: null },
      analyzedAt: { type: Date, default: null }
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    assignedAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.SUBMITTED,
      index: true
    },
    statusHistory: [statusHistorySchema],
    progressNotes: [progressNoteSchema],
    resolutionEvidence: {
      type: resolutionEvidenceSchema,
      default: () => ({})
    },
    citizenVerification: {
      type: citizenVerificationSchema,
      default: () => ({})
    },
    potentialDuplicates: [potentialDuplicateSchema]
  },
  {
    timestamps: true
  }
);

// Create 2dsphere index for GeoJSON location
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ createdAt: -1 });

reportSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
