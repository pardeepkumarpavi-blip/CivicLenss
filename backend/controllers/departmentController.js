import Department from '../models/Department.js';
import { logAuditEvent } from '../services/auditService.js';

export const getDepartments = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const departments = await Department.find(filter).sort({ name: 1 }).lean();

    return res.status(200).json({
      success: true,
      departments
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, city, jurisdiction, contactEmail, contactPhone } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and unique code are required.'
      });
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Department code ${code} is already in use.`
      });
    }

    const department = new Department({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description ? description.trim() : '',
      city: city ? city.trim() : 'Karachi',
      jurisdiction: jurisdiction ? jurisdiction.trim() : 'Karachi Metropolitan Area',
      contactEmail: contactEmail ? contactEmail.toLowerCase().trim() : null,
      contactPhone: contactPhone ? contactPhone.trim() : null
    });

    await department.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DEPARTMENT_CREATED',
      targetType: 'Department',
      targetId: department._id,
      newValue: { name: department.name, code: department.code },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, jurisdiction, contactEmail, contactPhone, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const prev = {
      name: department.name,
      description: department.description,
      isActive: department.isActive
    };

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (jurisdiction) department.jurisdiction = jurisdiction.trim();
    if (contactEmail !== undefined) department.contactEmail = contactEmail ? contactEmail.toLowerCase().trim() : null;
    if (contactPhone !== undefined) department.contactPhone = contactPhone ? contactPhone.trim() : null;
    if (typeof isActive === 'boolean') department.isActive = isActive;

    await department.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DEPARTMENT_UPDATED',
      targetType: 'Department',
      targetId: department._id,
      previousValue: prev,
      newValue: { name: department.name, isActive: department.isActive },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department
    });
  } catch (error) {
    next(error);
  }
};
