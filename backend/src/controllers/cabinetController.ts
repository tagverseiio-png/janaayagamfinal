import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import Department from '../models/Department';
import CabinetReport from '../models/CabinetReport';

export const generateCabinetReport = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'CM') {
      return res.status(403).json({ error: 'Only CM can generate cabinet reports' });
    }

    const tickets = await Ticket.find().populate('department');
    const departments = await Department.find();
    
    const rankings = departments.map(dept => {
      const deptTickets = tickets.filter(t => t.departmentId?.toString() === dept.id);
      const resolved = deptTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const rate = deptTickets.length > 0 ? Math.round((resolved / deptTickets.length) * 100) : 100;
      
      let minister = 'Unassigned';
      if (dept.slug === 'electricity') minister = 'C. T. R. Nirmal Kumar';
      if (dept.slug === 'health') minister = 'Dr. K.G. Arunraj';

      return { 
        dept: dept.name, 
        minister, 
        rate, 
        pending: deptTickets.length - resolved 
      };
    }).sort((a, b) => b.rate - a.rate);

    const report = await CabinetReport.create({
      title: 'TAMIL NADU STATE CABINET EFFICIENCY SUMMARY',
      summaryText: 'Electricity and Sanitation sectors maintain peak response compliance.',
      rankings: JSON.stringify(rankings)
    });

    res.status(201).json({
      ...report.toJSON(),
      rankings: JSON.parse(report.rankings)
    });
  } catch (error) {
    console.error('Error generating cabinet report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLatestCabinetReport = async (req: Request, res: Response) => {
  try {
    const report = await CabinetReport.findOne().sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ error: 'No report found' });
    }

    res.json({
      ...report.toJSON(),
      rankings: JSON.parse(report.rankings)
    });
  } catch (error) {
    console.error('Error fetching cabinet report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
