import { Request, Response } from 'express';
import Employee from '../models/Employee';
import Citizen from '../models/Citizen';
import Jurisdiction from '../models/Jurisdiction';
import { generateToken, TokenPayload } from '../utils/jwt';
import bcrypt from 'bcryptjs';

export const loginEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const employee = await Employee.findOne({ username })
      .populate('department')
      .populate('jurisdiction');

    if (!employee) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload: TokenPayload = {
      id: employee.id,
      role: employee.role,
      type: 'employee',
      category: employee.category,
      departmentId: employee.departmentId ? employee.departmentId.toString() : undefined,
      jurisdictionId: employee.jurisdictionId ? employee.jurisdictionId.toString() : undefined
    };

    const token = generateToken(payload);

    res.json({
      message: 'Login successful',
      token,
      employee
    });
  } catch (error) {
    console.error('Employee Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const signupCitizen = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, district } = req.body;

    if (!phone || !name) {
      res.status(400).json({ error: 'Phone and name are required' });
      return;
    }

    const existing = await Citizen.findOne({ phone });

    if (existing) {
      res.status(409).json({ error: 'Phone already registered. Please login.' });
      return;
    }

    const citizen = await Citizen.create({
      phone,
      name,
      district: district || null
    });

    const jurisdiction = district ? await Jurisdiction.findOne({
      name: district,
      level: 'DISTRICT'
    }) : null;

    const payload: TokenPayload = {
      id: citizen.id,
      role: 'citizen',
      type: 'citizen'
    };

    const token = generateToken(payload);

    res.status(201).json({
      message: 'Registration successful',
      token,
      citizen: {
        ...citizen.toJSON(),
        jurisdiction
      }
    });
  } catch (error) {
    console.error('Citizen Signup Error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
};

export const loginCitizen = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: 'Phone is required' });
      return;
    }

    const citizen = await Citizen.findOne({ phone });

    if (!citizen) {
      res.status(404).json({
        error: 'Account not found. Please sign up first.',
        code: 'NOT_REGISTERED'
      });
      return;
    }

    const jurisdiction = citizen.district ? await Jurisdiction.findOne({
      name: citizen.district,
      level: 'DISTRICT'
    }) : null;

    const payload: TokenPayload = {
      id: citizen.id,
      role: 'citizen',
      type: 'citizen'
    };

    const token = generateToken(payload);

    res.json({
      message: 'Login successful',
      token,
      citizen: {
        ...citizen.toJSON(),
        jurisdiction
      }
    });
  } catch (error) {
    console.error('Citizen Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const loginEmployeeAadhaar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { aadhaar } = req.body;

    if (!aadhaar) {
      res.status(400).json({ error: 'Aadhaar is required' });
      return;
    }

    // Look up employee by Aadhaar username
    const employee = await Employee.findOne({ username: aadhaar })
      .populate('department')
      .populate('jurisdiction');

    if (!employee) {
      res.status(401).json({
        error: 'No employee account found. Contact your administrator.',
        code: 'EMPLOYEE_NOT_FOUND'
      });
      return;
    }

    const payload: TokenPayload = {
      id: employee.id,
      role: employee.role,
      type: 'employee',
      category: employee.category,
      departmentId: employee.departmentId ? employee.departmentId.toString() : undefined,
      jurisdictionId: employee.jurisdictionId ? employee.jurisdictionId.toString() : undefined
    };

    const token = generateToken(payload);

    res.json({
      message: 'Aadhaar login successful',
      token,
      employee
    });
  } catch (error) {
    console.error('Aadhaar Employee Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const updateVolunteerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const citizenId = req.user?.id;
    if (!citizenId || req.user?.type !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can update volunteer status' });
      return;
    }
    const { isVolunteer, volunteerWard } = req.body;
    const citizen = await Citizen.findOneAndUpdate(
      { _id: citizenId },
      {
        isVolunteer: isVolunteer === true,
        volunteerWard: volunteerWard || null
      },
      { new: true }
    );
    res.json({
      message: 'Volunteer status updated successfully',
      citizen
    });
  } catch (error) {
    console.error('Update Volunteer Status Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
