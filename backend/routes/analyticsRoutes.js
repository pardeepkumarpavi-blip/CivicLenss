import express from 'express';
import {
  getOverviewAnalytics,
  getCategoryAnalytics,
  getStatusAnalytics,
  getDepartmentAnalytics,
  getTrendsAnalytics,
  getAreaAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// Publicly available or authenticated analytics (database-driven)
router.get('/overview', getOverviewAnalytics);
router.get('/categories', getCategoryAnalytics);
router.get('/status', getStatusAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/trends', getTrendsAnalytics);
router.get('/areas', getAreaAnalytics);

export default router;
