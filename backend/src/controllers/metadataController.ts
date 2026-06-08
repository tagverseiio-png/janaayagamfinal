import { Request, Response } from 'express';
import { prisma } from '../index';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJurisdictions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optionally filter by level or parentId via query params
    const { level, parentId } = req.query;

    const query: any = {};
    if (level) query.level = level;
    if (parentId) query.parentId = parentId;

    const jurisdictions = await prisma.jurisdiction.findMany({
      where: query,
      orderBy: { name: 'asc' }
    });
    
    res.json(jurisdictions);
  } catch (error) {
    console.error('Error fetching jurisdictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createJurisdiction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, level, parentId } = req.body;
    if (!name || !level) {
      res.status(400).json({ error: 'Name and level are required' });
      return;
    }

    const jurisdiction = await prisma.jurisdiction.create({
      data: { name, level, parentId: parentId || null }
    });
    
    res.status(201).json(jurisdiction);
  } catch (error) {
    console.error('Error creating jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateJurisdiction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, level, parentId } = req.body;
    
    const jurisdiction = await prisma.jurisdiction.update({
      where: { id },
      data: { name, level, parentId }
    });
    
    res.json(jurisdiction);
  } catch (error) {
    console.error('Error updating jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteJurisdiction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Safety check: Don't delete if it has child jurisdictions
    const children = await prisma.jurisdiction.findMany({ where: { parentId: id }});
    if (children.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because it has child jurisdictions. Delete them first.' });
      return;
    }

    // Safety check: Don't delete if it has attached employees
    const employees = await prisma.employee.findMany({ where: { jurisdictionId: id }});
    if (employees.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because employees are assigned to it.' });
      return;
    }

    // Safety check: Don't delete if it has attached tickets
    const tickets = await prisma.ticket.findMany({ where: { jurisdictionId: id }});
    if (tickets.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because tickets are linked to it.' });
      return;
    }

    await prisma.jurisdiction.delete({ where: { id }});
    res.json({ message: 'Jurisdiction deleted successfully' });
  } catch (error) {
    console.error('Error deleting jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
