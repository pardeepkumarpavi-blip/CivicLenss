import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import app from '../server.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { bootstrapSystem } from '../utils/bootstrap.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Report from '../models/Report.js';
import AuthorityInvitation from '../models/AuthorityInvitation.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import ComplaintCounter from '../models/ComplaintCounter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dummy image fixture for upload testing
const testImagePath = path.join(__dirname, 'test-evidence.png');
before(() => {
  // Create a minimal 1x1 PNG file buffer
  const minimalPng = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d400000000049454e44ae426082',
    'hex'
  );
  fs.writeFileSync(testImagePath, minimalPng);
});

after(() => {
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
});

describe('CivicLens AI Municipal Platform End-to-End Test Suite', () => {
  let citizenToken = null;
  let citizenUser = null;
  let adminToken = null;
  let adminUser = null;
  let authorityToken = null;
  let authorityUser = null;
  let sampleDepartmentId = null;
  let createdReportId = null;
  let createdReportRef = null;
  let invitationToken = null;

  before(async () => {
    // Connect to test database
    process.env.NODE_ENV = 'test';
    const testMongoUri = 'mongodb://127.0.0.1:27017/civiclens_test';
    await connectDB(testMongoUri);

    // Clean test database collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await Report.deleteMany({});
    await AuthorityInvitation.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await ComplaintCounter.deleteMany({});

    // Bootstrap initial departments and Super Admin
    await bootstrapSystem();

    const dept = await Department.findOne({ code: 'SWM' });
    assert.ok(dept, 'Sanitation department should be bootstrapped');
    sampleDepartmentId = dept._id.toString();
  });

  after(async () => {
    await disconnectDB();
  });

  test('GET /api/health returns operational status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'operational');
    assert.equal(res.body.jurisdiction, 'Karachi, Sindh, Pakistan');
  });

  test('Super Admin bootstrapped account can login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@civiclens.local',
        password: 'CivicLensAdmin@2026'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'super_admin');
    assert.ok(res.body.accessToken);
    adminToken = res.body.accessToken;
    adminUser = res.body.user;
  });

  test('Citizen Registration: Role escalation is strictly prevented', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tariq Mehmood',
        email: 'tariq.citizen@example.com',
        password: 'CitizenSecurePass@123',
        confirmPassword: 'CitizenSecurePass@123',
        city: 'Karachi',
        phoneNumber: '03001234567',
        role: 'super_admin' // malicious attempt to claim super_admin role
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // MUST be citizen regardless of requested role
    assert.equal(res.body.user.role, 'citizen');
    assert.ok(res.body.accessToken);
    citizenToken = res.body.accessToken;
    citizenUser = res.body.user;

    // Verify in database that password hash is saved, not plaintext
    const dbUser = await User.findOne({ email: 'tariq.citizen@example.com' }).select('+passwordHash');
    assert.notEqual(dbUser.passwordHash, 'CitizenSecurePass@123');
    assert.equal(dbUser.role, 'citizen');
  });

  test('Citizen cannot use Authority Login endpoint', async () => {
    const res = await request(app)
      .post('/api/authority/login')
      .send({
        email: 'tariq.citizen@example.com',
        password: 'CitizenSecurePass@123'
      });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /reserved exclusively for authorized municipal personnel/i);
  });

  test('Super Admin creates an Authority Invitation', async () => {
    const res = await request(app)
      .post('/api/admin/authority-invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        officialName: 'Engr. Farhan Siddiqui',
        officialEmail: 'farhan.swm@kmc.gov.pk',
        organization: 'Karachi Metropolitan Corporation',
        departmentId: sampleDepartmentId,
        designation: 'Head of Sanitation and Solid Waste',
        employeeId: 'KMC-SWM-409',
        role: 'department_head'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, 'Should return the one-time invitation token');
    invitationToken = res.body.token;
  });

  test('Invited Authority accepts invitation and activates account', async () => {
    const res = await request(app)
      .post('/api/authority/accept-invitation')
      .send({
        token: invitationToken,
        password: 'AuthorityPassword@2026',
        confirmPassword: 'AuthorityPassword@2026'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'department_head');
    assert.ok(res.body.accessToken);
    authorityToken = res.body.accessToken;
    authorityUser = res.body.user;

    // Verify invitation is marked accepted
    const inviteInDb = await AuthorityInvitation.findOne({ officialEmail: 'farhan.swm@kmc.gov.pk' });
    assert.equal(inviteInDb.status, 'accepted');
  });

  test('Authority logs in via Authority Login endpoint', async () => {
    const res = await request(app)
      .post('/api/authority/login')
      .send({
        email: 'farhan.swm@kmc.gov.pk',
        password: 'AuthorityPassword@2026'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'department_head');
    assert.ok(res.body.accessToken);
    authorityToken = res.body.accessToken;
  });

  test('Citizen submits complaint with photographic evidence and coordinates', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Large garbage accumulation blocking Shahrah-e-Faisal service road near Nursery bridge.')
      .field('issueCategory', 'Waste Management')
      .field('locationAddress', 'Nursery Flyover Service Road, PECHS Block 6')
      .field('city', 'Karachi')
      .field('area', 'PECHS')
      .field('latitude', '24.8615')
      .field('longitude', '67.0673')
      .field('severitySuggestion', 'High')
      .attach('image', testImagePath);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.referenceId, /^CL-2026-\d{5}$/);
    createdReportId = res.body.report._id;
    createdReportRef = res.body.referenceId;

    // Verify database record
    const report = await Report.findById(createdReportId);
    assert.ok(report);
    assert.equal(report.status, 'Submitted');
    assert.equal(report.location.type, 'Point');
    assert.equal(report.location.coordinates[0], 67.0673);
    assert.equal(report.location.coordinates[1], 24.8615);
  });

  test('Duplicate detection identifies nearby complaints with matching category', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Massive trash pile on Nursery service road overflowing into traffic lane.')
      .field('issueCategory', 'Waste Management')
      .field('locationAddress', 'Nursery Service Lane')
      .field('city', 'Karachi')
      .field('area', 'PECHS')
      .field('latitude', '24.8616') // ~15 meters away
      .field('longitude', '67.0674')
      .attach('image', testImagePath);

    assert.equal(res.status, 201);
    assert.ok(res.body.potentialDuplicates.length > 0, 'Should flag nearby garbage complaint as potential duplicate');
    assert.equal(res.body.potentialDuplicates[0].referenceId, createdReportRef);
  });

  test('Citizen can view their submitted reports', async () => {
    const res = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.reports.length, 2);
    assert.equal(res.body.reports[1].referenceId, createdReportRef);
  });

  test('Public map endpoint returns sanitized reports without sensitive citizen contact info', async () => {
    const res = await request(app).get('/api/reports');
    assert.equal(res.status, 200);
    assert.ok(res.body.reports.length > 0);
    const pubReport = res.body.reports.find((r) => r.referenceId === createdReportRef);
    assert.ok(pubReport);
    // Ensure citizen personal details are never published
    assert.equal(pubReport.citizenId, undefined);
    assert.equal(pubReport.email, undefined);
    assert.equal(pubReport.phoneNumber, undefined);
  });

  test('Authority views complaint in municipal workspace', async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportRef}`)
      .set('Authorization', `Bearer ${authorityToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.report.referenceId, createdReportRef);
  });

  test('Authority routes/assigns complaint to Sanitation Department', async () => {
    const res = await request(app)
      .patch(`/api/authority/reports/${createdReportId}/assign`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({
        departmentId: sampleDepartmentId,
        notes: 'Assigned to Zone 3 Waste Clearance Team.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const updated = await Report.findById(createdReportId);
    assert.equal(updated.status, 'Assigned');
  });

  test('Authority updates status to In Progress with required explanation', async () => {
    const res = await request(app)
      .patch(`/api/authority/reports/${createdReportId}/status`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({
        status: 'In Progress',
        explanation: 'Compactor truck and cleanup crew dispatched to Nursery site.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const updated = await Report.findById(createdReportId);
    assert.equal(updated.status, 'In Progress');
  });

  test('Authority adds an official progress note', async () => {
    const res = await request(app)
      .post(`/api/authority/reports/${createdReportId}/notes`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({
        note: 'Debris removal underway. Approximately 3 tons of commercial garbage cleared.',
        isInternal: false
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.progressNotes.length, 1);
  });

  test('Authority uploads resolution evidence: Transitions to Awaiting Verification', async () => {
    const res = await request(app)
      .post(`/api/authority/reports/${createdReportId}/resolution-evidence`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .field('description', 'Site thoroughly cleaned, disinfected, and clear of all obstruction.')
      .attach('image', testImagePath);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const updated = await Report.findById(createdReportId);
    assert.equal(updated.status, 'Awaiting Verification');
    assert.ok(updated.resolutionEvidence.resolvedAt);
  });

  test('Citizen verifies resolution: Confirms resolved -> Transitions to Resolved', async () => {
    const res = await request(app)
      .post(`/api/reports/${createdReportId}/verify-resolution`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        confirmed: true,
        feedback: 'Inspected this morning. The area is completely clean now. Excellent work by KMC!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const updated = await Report.findById(createdReportId);
    assert.equal(updated.status, 'Resolved');
    assert.equal(updated.citizenVerification.status, 'Confirmed Resolved');
  });

  test('Citizen checks notifications for updates', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.notifications.length > 0);
  });

  test('Analytics endpoints return real database metrics', async () => {
    const overviewRes = await request(app).get('/api/analytics/overview');
    assert.equal(overviewRes.status, 200);
    assert.equal(overviewRes.body.data.totalReports, 2);
    assert.equal(overviewRes.body.data.resolvedReports, 1);

    const categoryRes = await request(app).get('/api/analytics/categories');
    assert.equal(categoryRes.status, 200);
    const wasteCat = categoryRes.body.data.find((c) => c.category === 'Waste Management');
    assert.equal(wasteCat.total, 2);

    const statusRes = await request(app).get('/api/analytics/status');
    assert.equal(statusRes.status, 200);
    const resolvedStatus = statusRes.body.data.find((s) => s.status === 'Resolved');
    assert.equal(resolvedStatus.count, 1);
  });

  test('Super Admin can view immutable audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.logs.length > 5, 'Audit log should record administrative and complaint actions');
  });

  test('Super Admin views platform health', async () => {
    const res = await request(app)
      .get('/api/admin/system-health')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.health.status, 'operational');
    assert.equal(res.body.health.counts.reports, 2);
  });
});
