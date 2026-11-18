import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  actorId = null,
  actorName = 'System',
  actorRole = 'system',
  action,
  targetType,
  targetId,
  previousValue = null,
  newValue = null,
  req = null
}) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
      userAgent = req.headers['user-agent'];
      if (!actorId && req.user) {
        actorId = req.user._id || req.user.id;
        actorName = req.user.name || actorName;
        actorRole = req.user.role || actorRole;
      }
    }

    const logEntry = new AuditLog({
      actorId,
      actorName,
      actorRole,
      action,
      targetType,
      targetId: String(targetId),
      previousValue,
      newValue,
      ipAddress,
      userAgent
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error(`[Audit Log Failure] Could not persist audit entry: ${error.message}`);
    // Non-blocking in case of secondary logging issue, but logged to stderr
    return null;
  }
};
