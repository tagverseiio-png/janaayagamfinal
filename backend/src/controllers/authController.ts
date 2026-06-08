import { Request, Response } from 'express';
import { prisma } from '../index';
import { generateToken, TokenPayload } from '../utils/jwt';
import bcrypt from 'bcryptjs';

export const loginEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const employee = await prisma.employee.findUnique({
      where: { username },
      include: { department: true, jurisdiction: true }
    });

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
      departmentId: employee.departmentId || undefined,
      jurisdictionId: employee.jurisdictionId || undefined
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

export const loginCitizen = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, pincode } = req.body;

    if (!phone) {
      res.status(400).json({ error: 'Phone is required' });
      return;
    }

    let citizen = await prisma.citizen.findUnique({
      where: { phone }
    });

    if (!citizen) {
      citizen = await prisma.citizen.create({
        data: {
          phone,
          name: name || 'Verified Citizen',
          // Assuming we resolve district from pincode in frontend and pass it
        }
      });
    }

    const payload: TokenPayload = {
      id: citizen.id,
      role: 'citizen',
      type: 'citizen'
    };

    const token = generateToken(payload);

    res.json({
      message: 'Login successful',
      token,
      citizen
    });
  } catch (error) {
    console.error('Citizen Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
