import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    actorName: {
      type: String,
      default: 'System'
    },
    actorRole: {
      type: String,
      default: 'system'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      index: true
    },
    targetId: {
      type: String,
      required: true,
      index: true
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Prevent edits to existing audit records (immutable append-only)
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    const err = new Error('Audit logs are append-only and cannot be modified.');
    return next(err);
  }
  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
