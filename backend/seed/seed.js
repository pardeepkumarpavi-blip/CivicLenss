import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { Notification } from '../models/Notification.js';
import { municipalAccounts, municipalReports } from './seedData.js';
import { createSampleSvgs } from './createSampleSvgs.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('[Municipal Seed] Initializing CivicLens Municipal Portal database...');
    await connectDB();

    // Ensure sample illustration assets exist in uploads
    createSampleSvgs();

    // Clean up previous records
    console.log('[Municipal Seed] Refreshing system accounts and case files...');
    await User.deleteMany({
      email: {
        $in: [
          ...municipalAccounts.map(a => a.email),
          'citizen@civiclens.demo',
          'authority@civiclens.demo',
          'admin@civiclens.demo'
        ]
      }
    });
    await Report.deleteMany({});
    await Notification.deleteMany({});

    // Seed Municipal Users
    console.log('[Municipal Seed] Creating official municipal authority officers & citizen accounts...');
    const createdUsers = {};
    const salt = await bcrypt.genSalt(10);

    for (const acc of municipalAccounts) {
      const passwordHash = await bcrypt.hash(acc.password, salt);
      const user = await User.create({
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        officialId: acc.officialId,
        isVerifiedOfficial: acc.isVerifiedOfficial || false,
        phone: acc.phone,
        cnic: acc.cnic || '',
        zone: acc.zone || 'Karachi Central',
        preferredLanguage: acc.preferredLanguage || 'en'
      });
      createdUsers[acc.email] = user;
      console.log(`[Municipal Seed] Registered: ${acc.role.toUpperCase()} -> ${acc.name} (${acc.email})`);
    }

    const citizenUser = createdUsers['ayesha.khan@citizen.pk'];
    const sanitationOfficer = createdUsers['sanitation.officer@civiclens.gov.pk'];
    const waterOfficer = createdUsers['water.board@civiclens.gov.pk'];
    const roadsOfficer = createdUsers['roads.director@civiclens.gov.pk'];

    // Seed Real Municipal Complaints
    console.log('[Municipal Seed] Loading official municipal case files...');
    const insertedReports = [];

    for (const r of municipalReports) {
      let assignedOfficer = sanitationOfficer;
      if (r.issueCategory === 'Water Leakage' || r.issueCategory === 'Drainage and Flooding') {
        assignedOfficer = waterOfficer;
      } else if (r.issueCategory === 'Road Damage') {
        assignedOfficer = roadsOfficer;
      }

      const report = await Report.create({
        referenceId: r.referenceId,
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenEmail: citizenUser.email,
        citizenPhone: citizenUser.phone,
        imageUrl: r.imageUrl,
        description: r.description,
        issueCategory: r.issueCategory,
        locationAddress: r.locationAddress,
        location: {
          type: 'Point',
          coordinates: r.coordinates
        },
        aiAnalysis: r.aiAnalysis,
        assignedDepartment: r.assignedDepartment,
        assignedAuthorityId: assignedOfficer._id,
        assignedAuthorityName: assignedOfficer.name,
        priority: r.priority,
        status: r.status,
        statusHistory: r.statusHistory.map(sh => ({
          ...sh,
          changedBy: sh.changedByName === citizenUser.name ? citizenUser._id : assignedOfficer._id
        })),
        progressNotes: (r.progressNotes || []).map(pn => ({
          ...pn,
          authorId: assignedOfficer._id
        })),
        resolutionEvidence: r.resolutionEvidence ? {
          ...r.resolutionEvidence,
          submittedBy: assignedOfficer._id
        } : undefined,
        citizenVerification: r.citizenVerification,
        isDemoSeed: false
      });
      insertedReports.push(report);
      console.log(`[Municipal Seed] Filed Case: ${report.referenceId} - ${report.issueCategory} [${report.status}]`);
    }

    // Seed Real Citizen Notifications
    await Notification.create([
      {
        userId: citizenUser._id,
        reportId: insertedReports[2]._id, // DHA Water Leakage
        title: 'Action Resolved — Please Verify',
        message: 'The Karachi Water & Sewerage Corporation (KW&SC) has repaired complaint CL-2026-00003. Please inspect and confirm resolution.',
        type: 'resolution_review',
        read: false
      },
      {
        userId: citizenUser._id,
        reportId: insertedReports[0]._id, // Gulshan Waste
        title: 'Work In Progress',
        message: 'Sindh Solid Waste Management Board (SSWMB) compactor vehicle #SSWMB-442 dispatched for complaint CL-2026-00001.',
        type: 'status_update',
        read: false
      },
      {
        userId: citizenUser._id,
        reportId: insertedReports[3]._id, // Clifton Pothole
        title: 'Case Routed and Assigned',
        message: 'Complaint CL-2026-00004 has been routed to Road Maintenance & Civil Works Directorate.',
        type: 'assignment',
        read: true
      }
    ]);

    console.log('\n========================================================================');
    console.log('🏛️  CIVICLENS MUNICIPAL COMMITTEE PORTAL — PRODUCTION DATABASE READY!');
    console.log('========================================================================');
    console.log('OFFICIAL MUNICIPAL AUTHORITY & DEPARTMENT ACCOUNTS:');
    console.log('------------------------------------------------------------------------');
    console.log('1. Sindh Solid Waste Management Board (SSWMB):');
    console.log('   Email:       sanitation.officer@civiclens.gov.pk');
    console.log('   Password:    Municipal@2026');
    console.log('   Officer:     Engr. Tariq Mehmood (Executive Engineer, ID: SSWMB-ENG-8402)');
    console.log('');
    console.log('2. Karachi Water & Sewerage Corporation (KW&SC):');
    console.log('   Email:       water.board@civiclens.gov.pk');
    console.log('   Password:    Municipal@2026');
    console.log('   Officer:     Engr. Asadullah Khan (Superintending Engineer, ID: KWSC-ENG-5190)');
    console.log('');
    console.log('3. Road Maintenance & Civil Works (KMC/DMC):');
    console.log('   Email:       roads.director@civiclens.gov.pk');
    console.log('   Password:    Municipal@2026');
    console.log('   Officer:     Rehan Hashmi (Director General, ID: KMC-DIR-1142)');
    console.log('');
    console.log('4. Municipal Commissioner / Oversight Administrator:');
    console.log('   Email:       commissioner@civiclens.gov.pk');
    console.log('   Password:    Municipal@2026');
    console.log('   Officer:     Syed Murtaza Wahab (Municipal Commissioner, ID: MUNICIPAL-EXEC-001)');
    console.log('------------------------------------------------------------------------');
    console.log('OFFICIAL CITIZEN ACCOUNT:');
    console.log('   Email:       ayesha.khan@citizen.pk');
    console.log('   Password:    Citizen@2026');
    console.log('   Citizen:     Ayesha Khan (CNIC: 42101-5839201-2)');
    console.log('------------------------------------------------------------------------');
    console.log('MUNICIPAL AUTHORITY REGISTRATION PASSKEY (Security Code):');
    console.log('   Passkey:     MUNICIPAL-GOV-2026-AUTH');
    console.log('========================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed municipal database:', error);
    process.exit(1);
  }
};

runSeed();
