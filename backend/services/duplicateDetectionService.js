import Report from '../models/Report.js';

export const findPotentialDuplicates = async ({
  longitude,
  latitude,
  issueCategory,
  description,
  maxDistanceMeters = 300,
  limit = 5
}) => {
  if (longitude === undefined || latitude === undefined || isNaN(longitude) || isNaN(latitude)) {
    return [];
  }

  try {
    // 1. Find reports within maxDistanceMeters with active status
    const nearbyReports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: maxDistanceMeters
        }
      },
      status: { $nin: ['Resolved', 'Rejected'] }
    })
      .select('referenceId issueCategory description locationAddress area status createdAt')
      .limit(limit * 2)
      .lean();

    if (!nearbyReports.length) {
      return [];
    }

    const duplicates = [];
    const inputWords = new Set(
      description
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    for (const report of nearbyReports) {
      let score = 0;
      const reasons = [];

      // Check category match
      if (report.issueCategory === issueCategory) {
        score += 50;
        reasons.push('Identical issue category');
      }

      // Check keyword overlap
      const reportWords = new Set(
        report.description
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );

      let sharedWords = 0;
      for (const word of inputWords) {
        if (reportWords.has(word)) {
          sharedWords++;
        }
      }

      if (sharedWords > 0) {
        const wordOverlapScore = Math.min(sharedWords * 10, 40);
        score += wordOverlapScore;
        reasons.push(`${sharedWords} matching descriptive term(s)`);
      }

      reasons.push(`Within ${maxDistanceMeters}m proximity`);
      score += 10; // proximity base score

      if (score >= 50) {
        duplicates.push({
          reportId: report._id,
          referenceId: report.referenceId,
          similarityScore: Math.min(score, 100),
          reason: reasons.join(', ')
        });
      }
    }

    return duplicates.slice(0, limit);
  } catch (error) {
    console.error('[Duplicate Detection Error]', error.message);
    return [];
  }
};
