import { Request, Response } from 'express';
import { prisma } from '../index';
import fs from 'fs';
import path from 'path';

const normalizeRoleKey = (role: string) => (role || '').toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');

const ROLE_ALIASES: Record<string, string[]> = {
  EB: ['E.B', 'EB', 'LINE_MAN', 'Line Man'],
  'E.B': ['E.B', 'EB', 'LINE_MAN', 'Line Man'],
  'WARD_AEO': ['WARD_AEO', 'Ward (AEO)', 'Ward AEO'],
  'WARD_AEO_OR_EB': ['WARD_AEO_OR_EB', 'Ward (AEO) / E.B', 'Ward AEO / EB'],
  'ASST_AREA_ENGINEER': ['ASST_AREA_ENGINEER', 'ASSISTANT_AREA_ENGINEER', 'Assistant Area Engineer', 'AAE'],
  'Assistant Area Engineer': ['AAE', 'Assistant Area Engineer', 'ASSISTANT_AREA_ENGINEER'],
  'AAE': ['AAE', 'Assistant Area Engineer', 'ASSISTANT_AREA_ENGINEER'],
  'AREA_ENGINEER': ['AREA_ENGINEER', 'Area Engineer', 'AE'],
  'Area Engineer': ['AE', 'Area Engineer', 'AREA_ENGINEER'],
  'AE': ['AE', 'Area Engineer', 'AREA_ENGINEER'],
  'DSI': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'Division Sanitary Inspector': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'Division Sanitary Inspector (DSI)': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'SANITARY_INSPECTOR': ['SANITARY_INSPECTOR', 'Sanitary Inspector (SI)', 'Sanitary Inspector', 'SI'],
  'Sanitary Inspector': ['SI', 'Sanitary Inspector', 'SANITARY_INSPECTOR'],
  'SI': ['SI', 'Sanitary Inspector', 'SANITARY_INSPECTOR'],
  'HEALTH_INSPECTOR': ['HEALTH_INSPECTOR', 'Health Inspector', 'HI'],
  'Health Inspector': ['HI', 'Health Inspector', 'HEALTH_INSPECTOR'],
  'HI': ['HI', 'Health Inspector', 'HEALTH_INSPECTOR'],
  'CITY_HEALTH_OFFICER': ['CITY_HEALTH_OFFICER', 'City Health Officer', 'City Health Inspector', 'CHI'],
  'City Health Inspector': ['CHI', 'City Health Inspector', 'CITY_HEALTH_OFFICER'],
  'CHI': ['CHI', 'City Health Inspector', 'CITY_HEALTH_OFFICER'],
  'DEPT_COMMISSIONER': ['DEPT_COMMISSIONER', 'Department Commissioner'],
  'Department Commissioner': ['DEPT_COMMISSIONER', 'Department Commissioner'],
  'COMMISSIONER': ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner'],
  'Commissioner': ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner'],
  'Corporation Commissioner': ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner']
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
          'COMMISSIONER',
          'Commissioner',
          'Corporation Commissioner',
          'MINISTER',
          'Minister'
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

    // Auto-assignment & Status setting based on department's first escalation role
    let assignedToId = null;
    let status = 'SUBMITTED';

    if (finalDeptId && finalCategoryId) {
      const category = await prisma.complaintCategory.findUnique({
        where: { id: finalCategoryId },
        include: { escalations: { orderBy: { level: 'asc' } } }
      });
      if (category && category.escalations.length > 0) {
        const firstRole = category.escalations[0].assigneeTitle;
        const officer = await findEmployeeByEscalationRole(finalDeptId, firstRole);
        if (officer) {
          assignedToId = officer.id;
          status = 'ASSIGNED';
          console.log(`[AUTO-ASSIGN] Ticket assigned to first level: ${firstRole} (${officer.name})`);
        }
      }
    }

    // Generate a simple ticket number
    const count = await prisma.ticket.count();
    const ticketNumber = `TN-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

    // Create ticket in database
    let ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        citizenId,
        departmentId: finalDeptId,
        categoryId: finalCategoryId,
        jurisdictionId: finalJurisId,
        lat: lat ? parseFloat(lat as string) : null,
        lng: lng ? parseFloat(lng as string) : null,
        status,
        assignedToId,
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

    // Save photo to disk if base64 data sent in JSON body
    let savedPhotoUrl = null;
    if (req.body.photo && typeof req.body.photo === 'string' && req.body.photo.startsWith('data:image/')) {
      const base64Data = req.body.photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadDir = path.join(__dirname, '../../uploads/tickets', ticket.id);
      fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, 'photo_1.jpg');
      fs.writeFileSync(filePath, buffer);
      savedPhotoUrl = `/uploads/tickets/${ticket.id}/photo_1.jpg`;
      console.log(`[PHOTO SAVE] Saved base64 photo to ${filePath}`);
    }

    if (savedPhotoUrl) {
      ticket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { photo: savedPhotoUrl },
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
    }

    // Record history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'created',
        notes: `Ticket submitted by citizen${status === 'ASSIGNED' ? ' and auto-assigned to first responder' : ''}`
      }
    });

    res.status(201).json(formatTicketResponse(ticket));
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message || 'Internal server error', stack: error.stack });
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

    // Recalculate priority based on claims count
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (ticket) {
      let newPriority = 'LOW';
      if (ticket.claimCount >= 15) newPriority = 'CRITICAL';
      else if (ticket.claimCount >= 7) newPriority = 'HIGH';
      else if (ticket.claimCount >= 3) newPriority = 'MEDIUM';

      if (ticket.priority !== newPriority) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { priority: newPriority }
        });
        
        await prisma.ticketHistory.create({
          data: {
            ticketId,
            action: 'priority_updated_by_claims',
            notes: `Priority automatically upgraded to ${newPriority} due to ${ticket.claimCount} citizen claims.`
          }
        });
      }
    }

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

  const host = process.env.BACKEND_URL || 'http://localhost:5001';
  const photoPath = ticket.photo;
  const fullPhotoUrl = photoPath ? (photoPath.startsWith('http') ? photoPath : `${host}${photoPath}`) : null;
  
  const proofPhotoPath = ticket.proofPhoto;
  const fullProofPhotoUrl = proofPhotoPath ? (proofPhotoPath.startsWith('http') ? proofPhotoPath : `${host}${proofPhotoPath}`) : null;

  return {
    ...ticket,
    photo: fullPhotoUrl,
    photo_url: fullPhotoUrl,
    proofPhoto: fullProofPhotoUrl,
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
      const citizen = await prisma.citizen.findUnique({ where: { id: user.id } });
      if (citizen && citizen.isVolunteer && citizen.volunteerWard && req.query.scope === 'ward') {
        const wardJurisdiction = await prisma.jurisdiction.findFirst({
          where: { level: 'WARD', name: citizen.volunteerWard }
        });
        if (wardJurisdiction) {
          query = {
            jurisdictionId: wardJurisdiction.id,
            status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] }
          };
        } else {
          query = { id: 'none' };
        }
      } else if (req.query.feed === 'true') {
        query = {
          status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'] }
        };
      } else {
        query = {
          OR: [
            { citizenId: user.id },
            { claims: { some: { citizenId: user.id } } }
          ]
        };
      }
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
        category: true,
        jurisdiction: true,
        assignedTo: { select: { name: true, role: true } },
        history: {
          select: {
            action: true,
            notes: true,
            createdAt: true,
            employee: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets.map(formatTicketResponse));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRoleRank = (role: string): number => {
  const r = (role || '').toUpperCase().trim();
  if (r === 'CM') return 10;
  if (r === 'MINISTER') return 9;
  if (r.includes('COMMISSIONER')) return 8;
  if (r.includes('CHI') || r.includes('CITY_HEALTH')) return 7;
  if (r.includes('HI') || r.includes('HEALTH_INSPECTOR')) return 6;
  if (r.includes('SI') || r.includes('SANITARY_INSPECTOR') || r.includes('AE') || r === 'AREA_ENGINEER') return 5;
  if (r.includes('DSI') || r.includes('ASSISTANT_AREA_ENGINEER') || r === 'AAE') return 4;
  if (r.includes('WORKER') || r.includes('WARD') || r.includes('VAO') || r.includes('BDO')) return 3;
  return 1;
};

const getNextEscalationRole = (currentRole: string): string | null => {
  const r = normalizeRoleKey(currentRole);
  if (r === 'AAE' || r === 'ASSISTANT_AREA_ENGINEER' || r === 'ASST_AREA_ENGINEER') return 'AE';
  if (r === 'AE' || r === 'AREA_ENGINEER') return 'Minister';
  if (r === 'DSI' || r === 'DIVISION_SANITARY_INSPECTOR') return 'SI';
  if (r === 'SI' || r === 'SANITARY_INSPECTOR') return 'HI';
  if (r === 'HI' || r === 'HEALTH_INSPECTOR') return 'CHI';
  if (r === 'CHI' || r === 'CITY_HEALTH_OFFICER' || r === 'CITY_HEALTH_INSPECTOR') return 'Department Commissioner';
  if (r === 'DEPARTMENT_COMMISSIONER' || r === 'DEPT_COMMISSIONER') return 'Corporation Commissioner';
  if (r === 'CORPORATION_COMMISSIONER' || r === 'COMMISSIONER') return 'Minister';
  return null;
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId, notes } = req.body;
    let employeeId = undefined;
    let isVolunteerUser = false;
    let volunteerName = '';

    const currentTicket = await prisma.ticket.findUnique({
      where: { id: id as string },
      include: { assignedTo: true, jurisdiction: true }
    });

    if (!currentTicket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    if (req.user?.type === 'citizen') {
      const citizen = await prisma.citizen.findUnique({ where: { id: req.user.id } });
      // Check if it's a volunteer escalating a ticket in their ward
      if (citizen && citizen.isVolunteer && citizen.volunteerWard && currentTicket.jurisdiction && currentTicket.jurisdiction.name === citizen.volunteerWard) {
        if (status?.toUpperCase() !== 'ESCALATED') {
          res.status(400).json({ error: 'Volunteers are only permitted to escalate tickets.' });
          return;
        }
        isVolunteerUser = true;
        volunteerName = citizen.name;
      } else {
        // Must be the owner of the ticket
        if (currentTicket.citizenId !== req.user.id) {
          res.status(403).json({ error: 'Forbidden: Only employees, verified volunteers, or the ticket owner can update this ticket.' });
          return;
        }
        // Citizen can only transition to CLOSED or REOPENED
        const targetStatus = status?.toUpperCase();
        if (targetStatus !== 'CLOSED' && targetStatus !== 'REOPENED') {
          res.status(400).json({ error: 'Citizens are only permitted to close or reopen their tickets.' });
          return;
        }
      }
    } else if (req.user?.type === 'employee') {
      employeeId = req.user.id;
    } else {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Check Mandatory Reason Text for Push Back or Escalation
    const currentStatus = currentTicket.status;
    const isPushBack = currentStatus && (
      (currentStatus === 'ESCALATED' && status?.toUpperCase() === 'ASSIGNED') ||
      (currentStatus === 'ASSIGNED' && status?.toUpperCase() === 'SUBMITTED') ||
      (status?.toUpperCase() === 'SUBMITTED')
    );

    if ((status?.toUpperCase() === 'ESCALATED' || isPushBack) && (!notes || notes.trim() === '')) {
      res.status(400).json({ error: 'Reason/Notes are mandatory for Escalation or Push Back actions.' });
      return;
    }

    // 2. Check Proof Photo validation at first-touch close (AAE/DSI level resolving or closing)
    const updater = employeeId ? await prisma.employee.findUnique({ where: { id: employeeId } }) : null;
    if (updater && (updater.role === 'AAE' || updater.role === 'DSI') && (status?.toUpperCase() === 'RESOLVED' || status?.toUpperCase() === 'CLOSED')) {
      if (!req.body.photo && !req.body.proofPhoto && !req.body.resolution_proof) {
        res.status(400).json({ error: 'Proof photo is mandatory for resolution/closure at AAE and DSI level.' });
        return;
      }
    }

    const data: any = {};
    if (status) data.status = status.toUpperCase();
    if (priority) data.priority = priority.toUpperCase();
    if (assignedToId) data.assignedToId = assignedToId;
    
    // Save new photo, proof photo, rating, and reopenReason fields
    const proofPhotoVal = req.body.proofPhoto || req.body.photo || req.body.resolution_proof;
    if (proofPhotoVal) data.proofPhoto = proofPhotoVal;
    if (req.body.rating !== undefined) data.rating = parseInt(req.body.rating, 10);
    if (req.body.reopenReason) data.reopenReason = req.body.reopenReason;

    // MLA Security & Flagging enforcement
    if (updater && updater.role === 'MLA') {
      if (status || priority || assignedToId) {
        res.status(403).json({ error: 'MLA is restricted to VIEW + FLAG only. Cannot change status, priority, or assignee.' });
        return;
      }
      if (!notes || notes.trim() === '') {
        res.status(400).json({ error: 'Flag notes are mandatory.' });
        return;
      }
      data.updatedAt = new Date();
    }

    // 3. Escalation Moves Exactly One Level Up
    if (data.status === 'ESCALATED') {
      const defaultRole = currentTicket.departmentId && (await prisma.department.findUnique({ where: { id: currentTicket.departmentId } }))?.slug === 'electricity' ? 'AAE' : 'DSI';
      const currentRole = currentTicket.assignedTo?.role || defaultRole;
      const nextRole = getNextEscalationRole(currentRole);

      if (nextRole && currentTicket.departmentId) {
        const supervisor = await findEmployeeByEscalationRole(currentTicket.departmentId, nextRole);
        if (supervisor) {
          data.assignedToId = supervisor.id;
          console.log(`[ESCALATION] Reassigned ticket ${id} to next role ${nextRole} (${supervisor.name}, ID: ${supervisor.id})`);
        } else {
          console.warn(`[ESCALATION WARNING] Could not find any employee for role ${nextRole} in department ${currentTicket.departmentId}. Leaving assignee unchanged.`);
        }
      }
    }

    // 4. Log Intervention if higher role acts on lower ticket
    let isIntervention = false;
    if (currentTicket.assignedToId && currentTicket.assignedToId !== employeeId && updater) {
      const assigneeRank = getRoleRank(currentTicket.assignedTo?.role || '');
      const updaterRank = getRoleRank(updater.role);
      if (updaterRank > assigneeRank) {
        isIntervention = true;
      }
    }

    const historyNotes = isVolunteerUser
      ? `ESCALATED by Volunteer ${volunteerName}: ${notes}`
      : (isIntervention 
          ? `INTERVENTION by ${updater?.name || 'Superior Officer'}: ${notes || 'Ticket overridden'}`
          : (notes || 'Ticket updated by official'));

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
    let historyAction = 'updated';
    if (isVolunteerUser) {
      historyAction = 'volunteer_escalation';
    } else if (updater && updater.role === 'MLA') {
      historyAction = 'MLA_FLAG';
    } else if (updater && updater.role === 'CM' && (req.body.isCmWatching || req.body.action === 'flag' || (notes && notes.startsWith('CM FLAG')))) {
      historyAction = 'CM_FLAG';
    } else if (isIntervention) {
      historyAction = 'intervention_override';
    } else if (status) {
      historyAction = `status_changed_to_${status.toUpperCase()}`;
    }

    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: historyAction,
        notes: historyNotes,
        employeeId
      }
    });

    res.json(formatTicketResponse(ticket));
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkAndAutoEscalateSlaBreaches = async (): Promise<void> => {
  try {
    const now = new Date();
    const breachedTickets = await prisma.ticket.findMany({
      where: {
        status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
        deadline: { lt: now }
      },
      include: {
        assignedTo: true,
        department: true
      }
    });

    if (breachedTickets.length === 0) return;

    console.log(`[SLA BREACH ENGINE] Found ${breachedTickets.length} tickets with breached SLA deadlines. Escalating...`);

    for (const ticket of breachedTickets) {
      const defaultRole = ticket.departmentId && ticket.department?.slug === 'electricity' ? 'AAE' : 'DSI';
      const currentRole = ticket.assignedTo?.role || defaultRole;
      const nextRole = getNextEscalationRole(currentRole);

      const updateData: any = {
        status: 'ESCALATED',
        updatedAt: new Date()
      };

      let supervisorName = '';
      if (nextRole && ticket.departmentId) {
        const supervisor = await findEmployeeByEscalationRole(ticket.departmentId, nextRole);
        if (supervisor) {
          updateData.assignedToId = supervisor.id;
          supervisorName = `${supervisor.name} (${nextRole})`;
        }
      }

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: updateData
      });

      // Log to history
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          action: 'status_changed_to_ESCALATED',
          notes: `SLA Breached! Auto-escalated from ${currentRole} to ${supervisorName || nextRole || 'Next Level'}.`
        }
      });

      console.log(`[SLA BREACH ENGINE] Ticket ${ticket.ticketNumber} auto-escalated to ${supervisorName || nextRole || 'Next Level'}`);
    }
  } catch (error) {
    console.error('[SLA BREACH ENGINE ERROR]:', error);
  }
};
