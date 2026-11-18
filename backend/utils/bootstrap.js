import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { ROLES, PERMISSIONS } from '../config/constants.js';
import { logAuditEvent } from '../services/auditService.js';

export const bootstrapSystem = async () => {
  try {
    // 1. Bootstrap standard municipal departments if none exist
    const departmentCount = await Department.countDocuments();
    if (departmentCount === 0) {
      const defaultDepartments = [
        {
          name: 'Sanitation and Solid Waste Management',
          code: 'SWM',
          description: 'Garbage accumulation, illegal dumping, street sweeping, and commercial solid waste removal.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'sanitation@civiclens.local'
        },
        {
          name: 'Municipal Drainage',
          code: 'MD',
          description: 'Stormwater drains, nallah blockages, and monsoon urban flooding prevention.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'drainage@civiclens.local'
        },
        {
          name: 'Water Supply and Sewerage',
          code: 'WSS',
          description: 'Water pipeline leakages, sewerage line overflows, contaminated supply, and manhole covers.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'water@civiclens.local'
        },
        {
          name: 'Road Maintenance',
          code: 'RM',
          description: 'Potholes, surface erosion, damaged footpaths, road cracks, and infrastructure repair.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'roads@civiclens.local'
        },
        {
          name: 'Municipal Electrical Services',
          code: 'MES',
          description: 'Broken streetlights, dangling wiring hazards, municipal pole maintenance, and public illumination.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'electrical@civiclens.local'
        },
        {
          name: 'Environmental Protection',
          code: 'EP',
          description: 'Air pollution monitoring, industrial emissions, toxic waste, and municipal environmental hazards.',
          city: 'Karachi',
          jurisdiction: 'Karachi Metropolitan Area',
          contactEmail: 'environment@civiclens.local'
        }
      ];

      await Department.insertMany(defaultDepartments);
      console.log(`[Bootstrap] Created ${defaultDepartments.length} initial municipal departments.`);
    }

    // 2. Bootstrap Super Admin if no Super Admin exists
    const superAdminExists = await User.findOne({ role: ROLES.SUPER_ADMIN });
    if (!superAdminExists) {
      const adminName = process.env.BOOTSTRAP_ADMIN_NAME || 'Super Administrator';
      const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@civiclens.local';
      const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'CivicLensAdmin@2026';

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const superAdmin = new User({
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        role: ROLES.SUPER_ADMIN,
        designation: 'Head of Civic Technology Oversight',
        employeeId: 'ADM-001',
        permissions: Object.values(PERMISSIONS),
        accountStatus: 'active',
        verificationStatus: 'verified',
        preferredLanguage: 'en',
        city: 'Karachi'
      });

      await superAdmin.save();

      await logAuditEvent({
        actorId: superAdmin._id,
        actorName: superAdmin.name,
        actorRole: superAdmin.role,
        action: 'SYSTEM_BOOTSTRAP_SUPERADMIN',
        targetType: 'User',
        targetId: superAdmin._id,
        newValue: { email: superAdmin.email, role: superAdmin.role }
      });

      console.log(`[Bootstrap] Super Admin bootstrapped successfully: ${adminEmail}`);
      console.log(`[Security Notice] Ensure BOOTSTRAP_ADMIN_PASSWORD is changed in production.`);
    }
  } catch (error) {
    console.error(`[Bootstrap Error] ${error.message}`);
  }
};
