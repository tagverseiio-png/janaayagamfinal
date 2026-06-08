import { Request, Response } from 'express';
import { prisma } from '../index';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, departmentId, jurisdictionId, departmentName, jurisdictionName, lat, lng } = req.body;
    const citizenId = req.user?.id;

    if (!citizenId || req.user?.type !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can create tickets' });
      return;
    }

    let finalDeptId = departmentId;
    if (!finalDeptId && departmentName) {
      const dept = await prisma.department.findFirst({ where: { name: { contains: departmentName } } });
      if (dept) finalDeptId = dept.id;
    }

    let finalJurisId = jurisdictionId;
    if (!finalJurisId && jurisdictionName) {
      const juris = await prisma.jurisdiction.findFirst({ where: { name: { contains: jurisdictionName } } });
      if (juris) finalJurisId = juris.id;
    }

    // Generate a simple ticket number
    const count = await prisma.ticket.count();
    const ticketNumber = `TN-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        citizenId,
        departmentId: finalDeptId,
        jurisdictionId: finalJurisId,
        lat,
        lng,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });

    // Record history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'created',
        notes: 'Ticket submitted by citizen'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};

    if (user?.type === 'citizen') {
      query.citizenId = user.id;
    } else if (user?.type === 'employee') {
      if (user.departmentId) {
        query.departmentId = user.departmentId;
      }
      if (user.jurisdictionId) {
        const descendantIds = await getJurisdictionDescendants(user.jurisdictionId);
        query.jurisdictionId = {
          in: [user.jurisdictionId, ...descendantIds]
        };
      }
    }

    const tickets = await prisma.ticket.findMany({
      where: query,
      include: {
        citizen: { select: { name: true, phone: true } },
        department: true,
        jurisdiction: true,
        assignedTo: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId, notes } = req.body;
    const employeeId = req.user?.id;

    if (req.user?.type !== 'employee') {
      res.status(403).json({ error: 'Only employees can update tickets' });
      return;
    }

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId) data.assignedToId = assignedToId;

    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data
    });

    // Record history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: status ? `status_changed_to_${status}` : 'updated',
        notes: notes || 'Ticket updated by official',
        employeeId
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
