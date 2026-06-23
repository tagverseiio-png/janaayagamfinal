import { Request, Response } from 'express';
import Employee from '../models/Employee';
import Department from '../models/Department';
import Jurisdiction from '../models/Jurisdiction';
import bcrypt from 'bcryptjs';

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find()
      .populate('department')
      .populate('jurisdiction');

    // Remove password from response
    const sanitized = employees.map(emp => {
      const { password, ...rest } = emp.toObject();
      return rest;
    });
    res.json(sanitized);
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, phone, name, category, role, departmentName, jurisdictionLevel, jurisdictionName, jurisdictionId: providedJurisId } = req.body;

    if (!username || !password || !name || !category || !role) {
      res.status(400).json({ error: 'Username, password, name, category, and role are required' });
      return;
    }

    const existingUser = await Employee.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: 'Employee with this username already exists' });
      return;
    }

    if (phone) {
      const existingPhone = await Employee.findOne({ phone });
      if (existingPhone) {
        res.status(400).json({ error: 'Employee with this phone already exists' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let departmentId = null;
    if (departmentName) {
      let dept = await Department.findOne({ name: departmentName });
      if (!dept) {
        dept = await Department.create({ name: departmentName });
      }
      departmentId = dept._id;
    }

    let jurisdictionId = providedJurisId || null;
    if (!jurisdictionId && jurisdictionLevel && jurisdictionName) {
      let juris = await Jurisdiction.findOne({ level: jurisdictionLevel, name: jurisdictionName });
      if (!juris) {
        juris = await Jurisdiction.create({ level: jurisdictionLevel, name: jurisdictionName });
      }
      jurisdictionId = juris._id;
    }

    const newEmployee = await Employee.create({
      username,
      password: hashedPassword,
      phone,
      name,
      category,
      role,
      departmentId,
      jurisdictionId
    });

    const populatedEmployee = await Employee.findById(newEmployee._id)
      .populate('department')
      .populate('jurisdiction');

    const { password: _, ...employeeWithoutPassword } = populatedEmployee!.toObject();
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
