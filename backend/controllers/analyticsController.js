import Report from '../models/Report.js';
import Department from '../models/Department.js';
import { REPORT_STATUS, ISSUE_CATEGORIES } from '../config/constants.js';

export const getOverviewAnalytics = async (req, res, next) => {
  try {
    const [
      totalReports,
      resolvedReports,
      pendingReports,
      awaitingVerificationReports,
      reopenedReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: REPORT_STATUS.RESOLVED }),
      Report.countDocuments({
        status: { $in: [REPORT_STATUS.SUBMITTED, REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.ASSIGNED, REPORT_STATUS.IN_PROGRESS] }
      }),
      Report.countDocuments({ status: REPORT_STATUS.AWAITING_VERIFICATION }),
      Report.countDocuments({ status: REPORT_STATUS.REOPENED })
    ]);

    // Calculate real average resolution time from timestamps of resolved reports
    const resolvedDocs = await Report.find({ status: REPORT_STATUS.RESOLVED })
      .select('createdAt statusHistory')
      .lean();

    let avgResolutionHours = 0;
    if (resolvedDocs.length > 0) {
      let totalHours = 0;
      let countWithResolution = 0;

      for (const doc of resolvedDocs) {
        const resolvedEntry = doc.statusHistory?.find((h) => h.newStatus === REPORT_STATUS.RESOLVED);
        if (resolvedEntry && resolvedEntry.timestamp) {
          const diffMs = new Date(resolvedEntry.timestamp) - new Date(doc.createdAt);
          const hours = diffMs / (1000 * 60 * 60);
          if (hours >= 0) {
            totalHours += hours;
            countWithResolution++;
          }
        }
      }

      avgResolutionHours = countWithResolution > 0 ? Math.round((totalHours / countWithResolution) * 10) / 10 : 0;
    }

    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalReports,
        resolvedReports,
        pendingReports,
        awaitingVerificationReports,
        reopenedReports,
        resolutionRate,
        avgResolutionHours
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryAnalytics = async (req, res, next) => {
  try {
    const categoryAgg = await Report.aggregate([
      {
        $group: {
          _id: '$issueCategory',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', REPORT_STATUS.RESOLVED] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [REPORT_STATUS.SUBMITTED, REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.ASSIGNED, REPORT_STATUS.IN_PROGRESS]
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Format for Recharts
    const data = ISSUE_CATEGORIES.map((cat) => {
      const found = categoryAgg.find((c) => c._id === cat);
      return {
        category: cat,
        total: found ? found.total : 0,
        resolved: found ? found.resolved : 0,
        pending: found ? found.pending : 0
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getStatusAnalytics = async (req, res, next) => {
  try {
    const statusAgg = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const data = Object.values(REPORT_STATUS).map((status) => {
      const found = statusAgg.find((s) => s._id === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).select('name code').lean();

    const deptAgg = await Report.aggregate([
      {
        $match: { assignedDepartment: { $ne: null } }
      },
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', REPORT_STATUS.RESOLVED] }, 1, 0] }
          },
          active: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [REPORT_STATUS.ASSIGNED, REPORT_STATUS.IN_PROGRESS, REPORT_STATUS.AWAITING_VERIFICATION, REPORT_STATUS.REOPENED]
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const data = departments.map((dept) => {
      const found = deptAgg.find((d) => String(d._id) === String(dept._id));
      return {
        departmentId: dept._id,
        name: dept.name,
        code: dept.code,
        total: found ? found.total : 0,
        resolved: found ? found.resolved : 0,
        active: found ? found.active : 0
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendsAnalytics = async (req, res, next) => {
  try {
    // 6-month historical trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendsAgg = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', REPORT_STATUS.RESOLVED] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;

      const found = trendsAgg.find((t) => t._id.year === year && t._id.month === month);
      data.push({
        label: monthLabel,
        total: found ? found.total : 0,
        resolved: found ? found.resolved : 0
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAreaAnalytics = async (req, res, next) => {
  try {
    const areaAgg = await Report.aggregate([
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const data = areaAgg.map((a) => ({
      area: a._id || 'Unspecified Area',
      count: a.count
    }));

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
