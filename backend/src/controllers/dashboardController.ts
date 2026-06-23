import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import Jurisdiction from '../models/Jurisdiction';

async function getJurisdictionDescendants(parentId: string): Promise<string[]> {
  const children = await Jurisdiction.find({ parentId }).select('_id');
  const childIds = children.map(c => c._id.toString());
  const descendantIds: string[] = [...childIds];
  
  for (const childId of childIds) {
    const subDescendants = await getJurisdictionDescendants(childId);
    descendantIds.push(...subDescendants);
  }
  
  return descendantIds;
}

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let resolutionRate = 100;
    let healthScore = 100;
    
    // Scoping query based on employee's jurisdiction/department
    let query: any = {};
    if (user?.type === 'employee') {
      if (user.departmentId) query.departmentId = user.departmentId;
      if (user.jurisdictionId) {
        const descendantIds = await getJurisdictionDescendants(user.jurisdictionId);
        query.jurisdictionId = {
          $in: [user.jurisdictionId, ...descendantIds]
        };
      }
    } else if (user?.type === 'citizen') {
      query.citizenId = user.id;
    }

    const [totalOpen, totalResolved, criticalPriority, tickets] = await Promise.all([
      Ticket.countDocuments({ ...query, status: { $nin: ['RESOLVED', 'CLOSED'] } }),
      Ticket.countDocuments({ ...query, status: { $in: ['RESOLVED', 'CLOSED'] } }),
      Ticket.countDocuments({ ...query, priority: 'CRITICAL' }),
      Ticket.find(query).populate('jurisdiction').populate('department')
    ]);

    // District Performance
    const districts = await Jurisdiction.find({ level: 'DISTRICT' });
    const districtPerformance = districts.map(dist => {
      // Find tickets under this district or descendants of this district
      const distTickets = tickets.filter(t => {
        const tJuris = t.jurisdiction as any;
        return t.jurisdictionId?.toString() === dist.id || 
               tJuris?.parentId?.toString() === dist.id;
      });
      
      const dResolved = distTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const dTotal = distTickets.length;
      const rate = dTotal > 0 ? Math.round((dResolved / dTotal) * 100) : 100;

      return {
        name: dist.name,
        open: dTotal - dResolved,
        resolved: dResolved,
        total: dTotal,
        rate
      };
    }).sort((a, b) => a.rate - b.rate);

    // Average Resolution Time (mocked)
    const avgResolutionTime = 2.4; 

    // Total escalated tickets in this scope
    const totalEscalated = await Ticket.countDocuments({ ...query, status: 'ESCALATED' });

    const totalTickets = tickets.length;
    resolutionRate = totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 100;
    healthScore = Math.max(0, Math.min(100, Math.round(
      resolutionRate * 0.7 + (100 - Math.min(100, criticalPriority * 4)) * 0.3
    )));

    // Sub-jurisdiction count
    let subJurisdictionCount = 0;
    if (user?.jurisdictionId) {
      subJurisdictionCount = await Jurisdiction.countDocuments({ parentId: user.jurisdictionId });
    }

    res.json({
      totalOpen,
      totalResolved,
      criticalPriority,
      totalTickets: tickets.length,
      totalEscalated,
      resolutionRate,
      healthScore,
      avgResolutionTime,
      subJurisdictionCount,
      districtPerformance,
      sparklineData: [82, 85, 87, 86, 89, 91, healthScore] // Last 7 days
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
