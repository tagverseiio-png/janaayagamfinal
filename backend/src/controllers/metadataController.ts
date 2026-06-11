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
      where: { id: id as string },
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
    const children = await prisma.jurisdiction.findMany({ where: { parentId: id as string }});
    if (children.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because it has child jurisdictions. Delete them first.' });
      return;
    }

    // Safety check: Don't delete if it has attached employees
    const employees = await prisma.employee.findMany({ where: { jurisdictionId: id as string }});
    if (employees.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because employees are assigned to it.' });
      return;
    }

    // Safety check: Don't delete if it has attached tickets
    const tickets = await prisma.ticket.findMany({ where: { jurisdictionId: id as string }});
    if (tickets.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because tickets are linked to it.' });
      return;
    }

    await prisma.jurisdiction.delete({ where: { id: id as string }});
    res.json({ message: 'Jurisdiction deleted successfully' });
  } catch (error) {
    console.error('Error deleting jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComplaintCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.complaintCategory.findMany({
      include: {
        department: true,
        escalations: {
          orderBy: { level: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching complaint categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { code: 'asc' }
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLifecycleTransitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transitions = await prisma.ticketStateTransition.findMany();
    res.json(transitions);
  } catch (error) {
    console.error('Error fetching lifecycle transitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = req.params.department_slug || req.query.department;
    
    if (!department) {
      // Return full list of all hierarchies
      const departments = await prisma.department.findMany({
        include: {
          categories: {
            include: {
              escalations: {
                orderBy: { level: 'asc' }
              }
            }
          }
        }
      });
      
      const fullList = departments.map(d => ({
        department: d.name,
        slug: d.slug,
        steps: d.categories[0]?.escalations.map(e => ({
          role: e.assigneeTitle,
          label: e.assigneeTitle,
          slaDays: e.slaDays
        })) || []
      }));
      res.json(fullList);
      return;
    }

    const deptStr = String(department).toLowerCase().trim();
    
    // Query department by slug case-insensitively
    const dept = await prisma.department.findFirst({
      where: {
        slug: {
          equals: deptStr,
          mode: 'insensitive'
        }
      },
      include: {
        categories: {
          include: {
            escalations: {
              orderBy: { level: 'asc' }
            }
          }
        }
      }
    });

    if (!dept) {
      res.status(404).json({ error: `Department hierarchy not found for: ${department}` });
      return;
    }

    const steps = dept.categories[0]?.escalations.map(e => ({
      role: e.assigneeTitle,
      label: e.assigneeTitle,
      slaDays: e.slaDays
    })) || [];

    res.json({
      department: dept.name,
      slug: dept.slug,
      steps: steps
    });
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

