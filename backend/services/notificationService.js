import Notification from '../models/Notification.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  reportId = null,
  reportReferenceId = null
}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      reportId,
      reportReferenceId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error(`[Notification Failure] Could not persist notification: ${error.message}`);
    return null;
  }
};
