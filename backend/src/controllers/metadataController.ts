import { Request, Response } from 'express';
import Department from '../models/Department';
import Jurisdiction from '../models/Jurisdiction';
import Role from '../models/Role';
import Zone from '../models/Zone';
import TicketStateTransition from '../models/TicketStateTransition';
import PincodeMapping from '../models/PincodeMapping';
import ComplaintCategory from '../models/ComplaintCategory';
import Employee from '../models/Employee';
import Ticket from '../models/Ticket';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJurisdictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, parentId } = req.query;

    const query: any = {};
    if (level) query.level = level;
    if (parentId) query.parentId = parentId;

    const jurisdictions = await Jurisdiction.find(query).sort({ name: 1 });
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

    const jurisdiction = await Jurisdiction.create({
      name,
      level,
      parentId: parentId || null
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
    
    const jurisdiction = await Jurisdiction.findByIdAndUpdate(
      id,
      { name, level, parentId: parentId || null },
      { new: true }
    );
    
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
    const children = await Jurisdiction.find({ parentId: id });
    if (children.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because it has child jurisdictions. Delete them first.' });
      return;
    }

    // Safety check: Don't delete if it has attached employees
    const employees = await Employee.find({ jurisdictionId: id });
    if (employees.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because employees are assigned to it.' });
      return;
    }

    // Safety check: Don't delete if it has attached tickets
    const tickets = await Ticket.find({ jurisdictionId: id });
    if (tickets.length > 0) {
      res.status(400).json({ error: 'Cannot delete jurisdiction because tickets are linked to it.' });
      return;
    }

    await Jurisdiction.findByIdAndDelete(id);
    res.json({ message: 'Jurisdiction deleted successfully' });
  } catch (error) {
    console.error('Error deleting jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComplaintCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await ComplaintCategory.find()
      .populate('department')
      .populate({
        path: 'escalations',
        options: { sort: { level: 1 } }
      })
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching complaint categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find().sort({ code: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const zones = await Zone.find().sort({ name: 1 });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLifecycleTransitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transitions = await TicketStateTransition.find();
    res.json(transitions);
  } catch (error) {
    console.error('Error fetching lifecycle transitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPincodeDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode } = req.params;
    const mappings = await PincodeMapping.find({ pincode });
    res.json(mappings);
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  console.log(`[getHierarchy] Called with query:`, req.query, `params:`, req.params);
  try {
    const department = req.params.department_slug || req.query.department;
    
    if (!department) {
      // Return full list of all hierarchies
      const departments = await Department.find().populate({
        path: 'categories',
        populate: {
          path: 'escalations',
          options: { sort: { level: 1 } }
        }
      });
      
      const fullList = departments.map((d: any) => ({
        department: d.name,
        slug: d.slug,
        steps: d.categories?.[0]?.escalations.map((e: any) => ({
          role: e.assigneeTitle,
          label: e.assigneeTitle,
          slaDays: e.slaDays
        })) || []
      }));
      res.json(fullList);
      return;
    }

    const deptStr = String(department).toLowerCase().trim();
    
    // Alias map for robust resolution
    let searchSlug = deptStr;
    if (deptStr.includes('electric') || deptStr.includes('energy')) searchSlug = 'electricity';
    else if (deptStr.includes('health') || deptStr.includes('sanit')) searchSlug = 'sanitation';
    else if (deptStr.includes('water')) searchSlug = 'water-resources';

    // Query department by slug or exact name
    const dept = await Department.findOne({
      $or: [
        { slug: searchSlug },
        { name: String(department) }
      ]
    });

    const categoryQuery = req.query.category as string;

    if (!dept) {
      res.status(404).json({ error: `Department hierarchy not found for: ${department}` });
      return;
    }

    const categories = await ComplaintCategory.find({ departmentId: dept._id }).populate({
      path: 'escalations',
      options: { sort: { level: 1 } }
    });

    let targetCategory = categories[0];
    if (categoryQuery) {
      const found = categories.find(c => c.name.toLowerCase() === String(categoryQuery).toLowerCase().trim() || c.id === categoryQuery);
      if (found) {
        targetCategory = found;
      }
    }

    const steps = targetCategory?.escalations?.map((e: any) => ({
      role: e.assigneeTitle,
      label: e.assigneeTitle,
      slaDays: e.slaDays
    })) || [];

    res.json({
      department: dept.name,
      slug: dept.slug,
      category: targetCategory?.name,
      steps: steps
    });
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, departmentId, jurisdictionId } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (departmentId) query.departmentId = departmentId;
    if (jurisdictionId) query.jurisdictionId = jurisdictionId;

    const employees = await Employee.find(query)
      .select('id name username phone role category jurisdictionId')
      .populate('jurisdiction', 'name');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
