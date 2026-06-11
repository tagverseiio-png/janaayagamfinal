import { Request, Response } from 'express';
import { prisma } from '../index';

const normalizeRoleKey = (role: string) => (role || '').toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');

const ROLE_ALIASES: Record<string, string[]> = {
  EB: ['E.B', 'EB', 'LINE_MAN', 'Line Man'],
  'E.B': ['E.B', 'EB', 'LINE_MAN', 'Line Man'],
  'WARD_AEO': ['WARD_AEO', 'Ward (AEO)', 'Ward AEO'],
  'WARD_AEO_OR_EB': ['WARD_AEO_OR_EB', 'Ward (AEO) / E.B', 'Ward AEO / EB'],
  'DEPUTY_AREA_ENGINEER': ['DEPUTY_AREA_ENGINEER', 'Deputy Area Engineer'],
  'ASST_AREA_ENGINEER': ['ASST_AREA_ENGINEER', 'ASSISTANT_AREA_ENGINEER', 'Assistant Area Engineer'],
  'AREA_ENGINEER': ['AREA_ENGINEER', 'Area Engineer'],
  'SUPER_AGENT': ['SUPER_AGENT', 'Super Agent'],
  'G.M': ['G.M', 'GM', 'G.M.'],
  'EXECUTIVE_DIRECTOR': ['EXECUTIVE_DIRECTOR', 'Executive Director'],
  'DEPT_DIRECTOR': ['DEPT_DIRECTOR', 'Department Director'],
  'DSI': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'SANITARY_INSPECTOR': ['SANITARY_INSPECTOR', 'Sanitary Inspector (SI)', 'Sanitary Inspector'],
  'HEALTH_INSPECTOR': ['HEALTH_INSPECTOR', 'Health Inspector'],
  'CITY_HEALTH_OFFICER': ['CITY_HEALTH_OFFICER', 'City Health Officer'],
  'DEPT_COMMISSIONER': ['DEPT_COMMISSIONER', 'Department Commissioner'],
  'COMMISSIONER': ['COMMISSIONER', 'Commissioner']
};

const findEmployeeByEscalationRole = async (departmentId: string, escalateToRole: string) => {
  const requestedRole = (escalateToRole || '').trim();
  const candidates = ROLE_ALIASES[requestedRole] || [requestedRole];

  for (const candidate of candidates) {
    const exact = await prisma.employee.findFirst({
      where: { departmentId, role: candidate }
    });
    if (exact) return exact;

    const normalized = await prisma.employee.findFirst({
      where: { departmentId, role: normalizeRoleKey(candidate) }
    });
    if (normalized) return normalized;
  }

  const fallback = await prisma.employee.findFirst({
    where: {
      departmentId,
      role: {
        in: [
          'DEPT_DIRECTOR',
          'Department Director',
          'COMMISSIONER',
          'Commissioner',
          'SUPER_AGENT',
          'Super Agent'
        ]
      }
    },
    orderBy: [
      { role: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return fallback || null;
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, departmentId, jurisdictionId, categoryCode, departmentName, jurisdictionName, lat, lng } = req.body;
    const citizenId = req.user?.id;

    if (!citizenId || req.user?.type !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can create tickets' });
      return;
    }

    let finalDeptId = departmentId;
    let finalCategoryId = undefined;

    if (categoryCode) {
      const category = await prisma.complaintCategory.findUnique({
        where: { code: categoryCode }
      });
      if (category) {
        finalCategoryId = category.id;
        if (!finalDeptId) finalDeptId = category.departmentId;
      }
    }

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
        categoryId: finalCategoryId,
        jurisdictionId: finalJurisId,
        lat,
        lng,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      include: {
        citizen: { select: { name: true, phone: true } },
        department: true,
        category: true,
        jurisdiction: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        }
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

    res.json(formatTicketResponse(ticket));
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkDuplicates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryCode, lat, lng } = req.query;

    if (!lat || !lng || !categoryCode) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // Find a ticket in the same category within 7.5 meters
    // SQLite doesn't have ST_Distance, so we use a simple bounding box first
    // 0.0001 degrees is roughly 11 meters
    const delta = 0.00007; // ~7.7 meters

    const duplicate = await prisma.ticket.findFirst({
      where: {
        category: { code: categoryCode as string },
        status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
        lat: { gte: latitude - delta, lte: latitude + delta },
        lng: { gte: longitude - delta, lte: longitude + delta }
      },
      include: {
        category: true,
        jurisdiction: true
      }
    });

    res.json(duplicate ? formatTicketResponse(duplicate) : null);
  } catch (error) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.body;
    const citizenId = req.user?.id;

    if (!citizenId || req.user?.type !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can add claims' });
      return;
    }

    // Check if already claimed
    const existingClaim = await prisma.ticketClaim.findUnique({
      where: {
        ticketId_citizenId: { ticketId, citizenId }
      }
    });

    if (existingClaim) {
      res.status(400).json({ error: 'You have already claimed this ticket' });
      return;
    }

    // Add claim
    await prisma.$transaction([
      prisma.ticketClaim.create({
        data: { ticketId, citizenId }
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: { claimCount: { increment: 1 } }
      }),
      prisma.ticketHistory.create({
        data: {
          ticketId,
          action: 'claim_added',
          notes: 'Claim added via duplicate detection or feed'
        }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding claim:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const formatTicketResponse = (ticket: any) => {
  let ward = '';
  let district = '';

  if (ticket.jurisdiction) {
    if (ticket.jurisdiction.level === 'WARD') {
      ward = ticket.jurisdiction.name;
      district = ticket.jurisdiction.parent?.parent?.parent?.name || 
                 ticket.jurisdiction.parent?.parent?.name || 
                 ticket.jurisdiction.parent?.name || 
                 'Chennai';
    } else {
      district = ticket.jurisdiction.name;
    }
  }

  return {
    ...ticket,
    category: ticket.category?.code || 'N/A',
    categoryName: ticket.category?.name || 'Uncategorized',
    created_at: ticket.createdAt,
    sla_deadline: ticket.deadline,
    ward: ward || ticket.jurisdiction?.name || '',
    district: district,
    citizen_name: ticket.citizen?.name || 'Anonymous'
  };
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

    res.json(tickets.map(formatTicketResponse));
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
    if (status) data.status = status.toUpperCase();
    if (priority) data.priority = priority.toUpperCase();
    if (assignedToId) data.assignedToId = assignedToId;

    if (data.status === 'ESCALATED' && req.body.escalateToRole) {
      const currentTicket = await prisma.ticket.findUnique({
        where: { id: id as string },
        select: { departmentId: true }
      });
      
      if (currentTicket?.departmentId) {
        const supervisor = await findEmployeeByEscalationRole(currentTicket.departmentId, req.body.escalateToRole);

        if (supervisor) {
          data.assignedToId = supervisor.id;
          console.log(`[ESCALATION] Reassigned ticket ${id} to role ${req.body.escalateToRole} (${supervisor.role}, ID: ${supervisor.id})`);
        } else {
          console.warn(`[ESCALATION WARNING] Could not find any employee for ${req.body.escalateToRole} in department ${currentTicket.departmentId}. Leaving assignee unchanged.`);
        }
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data,
      include: {
        citizen: { select: { name: true, phone: true } },
        department: true,
        category: true,
        jurisdiction: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        },
        assignedTo: { select: { name: true, role: true } }
      }
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

    res.json(formatTicketResponse(ticket));
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
