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

export const loginEmployeeAadhaar = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      aadhaar,
      name,
      category,
      role,
      departmentName,
      jurisdictionLevel,
      jurisdictionName
    } = req.body;

    if (!aadhaar || !name || !category || !role) {
      res.status(400).json({ error: 'Aadhaar, name, category, and role are required' });
      return;
    }

    // Resolve department
    let departmentId: string | null = null;
    if (departmentName) {
      let dept = await prisma.department.findUnique({
        where: { name: departmentName }
      });
      if (!dept) {
        dept = await prisma.department.findFirst({
          where: { name: { contains: departmentName } }
        });
      }
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: departmentName }
        });
      }
      departmentId = dept.id;
    }

    // Resolve jurisdiction
    let jurisdictionId: string | null = null;
    if (jurisdictionLevel && jurisdictionName) {
      let juris = await prisma.jurisdiction.findFirst({
        where: {
          level: jurisdictionLevel,
          name: { contains: jurisdictionName }
        }
      });
      if (!juris && jurisdictionLevel === 'STATE') {
        juris = await prisma.jurisdiction.findFirst({
          where: { level: 'STATE' }
        });
      }
      if (!juris) {
        // Fallback case-insensitive / partial match
        juris = await prisma.jurisdiction.findFirst({
          where: { name: { contains: jurisdictionName } }
        });
      }
      if (!juris) {
        const stateNode = await prisma.jurisdiction.findFirst({ where: { level: 'STATE' } });
        juris = await prisma.jurisdiction.create({
          data: {
            level: jurisdictionLevel,
            name: jurisdictionName,
            parentId: stateNode?.id || null
          }
        });
      }
      jurisdictionId = juris.id;
    }

    // Look up employee by Aadhaar username
    let employee = await prisma.employee.findUnique({
      where: { username: aadhaar },
      include: { department: true, jurisdiction: true }
    });

    const defaultPasswordHash = await bcrypt.hash('aadhaar-otp-auth-secure', 10);

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          username: aadhaar,
          password: defaultPasswordHash,
          name,
          category,
          role,
          departmentId,
          jurisdictionId
        },
        include: { department: true, jurisdiction: true }
      });
    } else {
      employee = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          name,
          category,
          role,
          departmentId,
          jurisdictionId
        },
        include: { department: true, jurisdiction: true }
      });
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
      message: 'Aadhaar login successful',
      token,
      employee
    });
  } catch (error) {
    console.error('Aadhaar Employee Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
