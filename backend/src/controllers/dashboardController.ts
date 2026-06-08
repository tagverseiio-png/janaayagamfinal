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
      prisma.ticket.count({ where: { ...query, status: 'open' } }),
      prisma.ticket.count({ where: { ...query, status: 'resolved' } }),
      prisma.ticket.count({ where: { ...query, priority: 'critical' } }),
      prisma.ticket.findMany({ where: query, select: { status: true, priority: true } })
    ]);

    res.json({
      totalOpen,
      totalResolved,
      criticalPriority,
      totalTickets: tickets.length,
      // Aggregation can be more complex (e.g. by category, district)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
