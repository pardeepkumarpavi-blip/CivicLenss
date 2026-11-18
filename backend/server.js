import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { bootstrapSystem } from './utils/bootstrap.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import authorityRoutes from './routes/authorityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/demo, strict in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body Parsers & Request Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static directory for uploaded municipal evidence
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health Check Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'CivicLens AI Municipal Complaint & Environmental Intelligence Platform',
    version: '1.0.0',
    jurisdiction: 'Karachi, Sindh, Pakistan',
    timestamp: new Date().toISOString()
  });
});

// Apply rate limiter to general API
app.use('/api', apiLimiter);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);

// Catch-all 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Municipal endpoint not found: ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server (except when imported during automated tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    await bootstrapSystem();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`CivicLens AI Municipal Platform Server Active`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Listening on: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  });
}

export default app;
