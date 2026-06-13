import { Request, Response } from 'express';
import { prisma } from '../index';

async function getJurisdictionDescendants(parentId: string): Promise<string[]> {
  const children = await prisma.jurisdiction.findMany({
    where: { parentId },
    select: { id: true }
  });
  
  const childIds = children.map(c => c.id);
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
          in: [user.jurisdictionId, ...descendantIds]
        };
      }
    } else if (user?.type === 'citizen') {
      query.citizenId = user.id;
    }

    const [totalOpen, totalResolved, criticalPriority, tickets] = await Promise.all([
      prisma.ticket.count({ where: { ...query, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...query, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...query, priority: 'CRITICAL' } }),
      prisma.ticket.findMany({ 
        where: query, 
        include: { 
          jurisdiction: true,
          department: true
        } 
      })
    ]);

    // District Performance
    const districts = await prisma.jurisdiction.findMany({ where: { level: 'DISTRICT' } });
    const districtPerformance = districts.map(dist => {
      const distTickets = tickets.filter(t => t.jurisdictionId === dist.id || (t.jurisdiction?.parentId === dist.id));
      // Note: This is a simplified check for descendants, might need more depth for real world
      
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

    // Average Resolution Time (mocked for now, but could be calculated from resolved tickets)
    const avgResolutionTime = 2.4; 

    // Total escalated tickets in this scope
    const totalEscalated = await prisma.ticket.count({ 
      where: { ...query, status: 'ESCALATED' } 
    });

    const totalTickets = tickets.length;
    resolutionRate = totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 100;
    healthScore = Math.max(0, Math.min(100, Math.round(
      resolutionRate * 0.7 + (100 - Math.min(100, criticalPriority * 4)) * 0.3
    )));

    // Sub-jurisdiction count
    let subJurisdictionCount = 0;
    if (user?.jurisdictionId) {
      subJurisdictionCount = await prisma.jurisdiction.count({
        where: { parentId: user.jurisdictionId }
      });
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
