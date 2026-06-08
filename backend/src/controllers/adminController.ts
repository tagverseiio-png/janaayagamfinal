import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        jurisdiction: true
      }
    });
    // Remove password from response
    const sanitized = employees.map(emp => {
      const { password, ...rest } = emp;
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

    const existingUser = await prisma.employee.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ error: 'Employee with this username already exists' });
      return;
    }

    if (phone) {
      const existingPhone = await prisma.employee.findUnique({ where: { phone } });
      if (existingPhone) {
        res.status(400).json({ error: 'Employee with this phone already exists' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let departmentId = null;
    if (departmentName) {
      let dept = await prisma.department.findUnique({ where: { name: departmentName } });
      if (!dept) {
          dept = await prisma.department.create({ data: { name: departmentName }});
      }
      departmentId = dept.id;
    }

    let jurisdictionId = providedJurisId || null;
    if (!jurisdictionId && jurisdictionLevel && jurisdictionName) {
      let juris = await prisma.jurisdiction.findFirst({
          where: { level: jurisdictionLevel, name: jurisdictionName }
      });
      if (!juris) {
          juris = await prisma.jurisdiction.create({ data: { level: jurisdictionLevel, name: jurisdictionName }});
      }
      jurisdictionId = juris.id;
    }

    const newEmployee = await prisma.employee.create({
      data: {
        username,
        password: hashedPassword,
        phone,
        name,
        category,
        role,
        departmentId,
        jurisdictionId
      },
      include: { department: true, jurisdiction: true }
    });

    const { password: _, ...employeeWithoutPassword } = newEmployee;
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({
      where: { id }
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
