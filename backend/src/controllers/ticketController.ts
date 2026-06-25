import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Ticket from '../models/Ticket';
import TicketHistory from '../models/TicketHistory';
import TicketClaim from '../models/TicketClaim';
import ComplaintCategory from '../models/ComplaintCategory';
import CategoryEscalation from '../models/CategoryEscalation';
import Department from '../models/Department';
import Jurisdiction from '../models/Jurisdiction';
import Employee from '../models/Employee';
import Citizen from '../models/Citizen';

const normalizeRoleKey = (role: string) => (role || '').toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');

const ROLE_ALIASES: Record<string, string[]> = {
  EB: ['EB', 'LINE_MAN', 'Line Man'],
  'WARD_AEO': ['WARD_AEO', 'Ward (AEO)', 'Ward AEO', 'Assistant Area Engineer', 'AAE'],
  'ASST_AREA_ENGINEER': ['AAE', 'Assistant Area Engineer', 'ASSISTANT_AREA_ENGINEER', 'ASST_AREA_ENGINEER', 'Ward (AEO)'],
  'ASSISTANT_AREA_ENGINEER': ['AAE', 'Assistant Area Engineer', 'ASSISTANT_AREA_ENGINEER', 'ASST_AREA_ENGINEER', 'Ward (AEO)'],
  'AAE': ['AAE', 'Assistant Area Engineer', 'ASSISTANT_AREA_ENGINEER', 'ASST_AREA_ENGINEER', 'Ward (AEO)'],
  'Area Engineer': ['AE', 'Area Engineer', 'AREA_ENGINEER'],
  'AE': ['AE', 'Area Engineer', 'AREA_ENGINEER'],
  'JE': ['JE', 'Junior Engineer', 'JUNIOR_ENGINEER'],
  'JUNIOR_ENGINEER': ['JE', 'Junior Engineer', 'JUNIOR_ENGINEER'],
  'AEE': ['AEE', 'Assistant Executive Engineer', 'ASSISTANT_EXECUTIVE_ENGINEER'],
  'ASSISTANT_EXECUTIVE_ENGINEER': ['AEE', 'Assistant Executive Engineer', 'ASSISTANT_EXECUTIVE_ENGINEER'],
  'EE': ['EE', 'Executive Engineer', 'EXECUTIVE_ENGINEER'],
  'EXECUTIVE_ENGINEER': ['EE', 'Executive Engineer', 'EXECUTIVE_ENGINEER'],
  'SE': ['SE', 'Superintending Engineer', 'SUPERINTENDING_ENGINEER'],
  'SUPERINTENDING_ENGINEER': ['SE', 'Superintending Engineer', 'SUPERINTENDING_ENGINEER'],
  'CE': ['CE', 'Chief Engineer', 'CHIEF_ENGINEER'],
  'CHIEF_ENGINEER': ['CE', 'Chief Engineer', 'CHIEF_ENGINEER'],
  'DSI': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'DIVISION_SANITARY_INSPECTOR': ['DSI', 'Division Sanitary Inspector (DSI)', 'Division Sanitary Inspector'],
  'SANITARY_INSPECTOR': ['SI', 'Sanitary Inspector', 'SANITARY_INSPECTOR'],
  'SI': ['SI', 'Sanitary Inspector', 'SANITARY_INSPECTOR'],
  'HEALTH_INSPECTOR': ['HI', 'Health Inspector', 'HEALTH_INSPECTOR'],
  'HI': ['HI', 'Health Inspector', 'HEALTH_INSPECTOR'],
  'CITY_HEALTH_OFFICER': ['CHI', 'City Health Officer', 'City Health Inspector'],
  'CITY_HEALTH_INSPECTOR': ['CHI', 'City Health Officer', 'City Health Inspector'],
  'CHI': ['CHI', 'City Health Inspector', 'CITY_HEALTH_OFFICER'],
  'DEPT_COMMISSIONER': ['DEPT_COMMISSIONER', 'Department Commissioner'],
  'DEPARTMENT_COMMISSIONER': ['DEPT_COMMISSIONER', 'Department Commissioner'],
  'COMMISSIONER': ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner'],
  'CORPORATION_COMMISSIONER': ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner'],
  'MINISTER': ['MINISTER', 'Minister', 'Cabinet Minister', 'Minister (Electricity & Energy Resources)', 'Minister (Health)'],
  'Minister': ['MINISTER', 'Minister', 'Cabinet Minister', 'Minister (Electricity & Energy Resources)', 'Minister (Health)'],
  'Minister (Electricity & Energy Resources)': ['MINISTER', 'Minister', 'Cabinet Minister', 'Minister (Electricity & Energy Resources)'],
  'Minister (Health)': ['MINISTER', 'Minister', 'Cabinet Minister', 'Minister (Health)']
};

const rolesMatch = (roleA: string, roleB: string): boolean => {
  const normA = normalizeRoleKey(roleA);
  const normB = normalizeRoleKey(roleB);
  if (normA === normB) return true;

  const candidatesA = ROLE_ALIASES[normA] || ROLE_ALIASES[roleA] || [roleA];
  const candidatesB = ROLE_ALIASES[normB] || ROLE_ALIASES[roleB] || [roleB];

  const normCandidatesA = candidatesA.map(r => normalizeRoleKey(r));
  const normCandidatesB = candidatesB.map(r => normalizeRoleKey(r));

  return normCandidatesA.some(r => normCandidatesB.includes(r));
};

const findEmployeeByEscalationRole = async (departmentId: string, escalateToRole: string, jurisdictionId?: string) => {
  const requestedRole = (escalateToRole || '').trim();
  const normalizedKey = normalizeRoleKey(requestedRole);
  const candidates = ROLE_ALIASES[normalizedKey] || ROLE_ALIASES[requestedRole] || [requestedRole];

  let currentJurisId: any = jurisdictionId;

  // 1. Try to find an employee with the role matching jurisdiction, then parent jurisdictions
  while (currentJurisId) {
    for (const candidate of candidates) {
      const match = await Employee.findOne({
        departmentId,
        role: { $in: [candidate, normalizeRoleKey(candidate)] },
        jurisdictionId: currentJurisId
      });
      if (match) return match;
    }

    // Move up the hierarchy
    const currentJuris = await Jurisdiction.findById(currentJurisId).select('parentId');
    currentJurisId = currentJuris?.parentId || undefined;
  }

  // 2. Final fallback: search department-wide regardless of jurisdiction
  for (const candidate of candidates) {
    const match = await Employee.findOne({
      departmentId,
      role: { $in: [candidate, normalizeRoleKey(candidate)] }
    }).sort({ createdAt: 1 });
    if (match) return match;
  }

  // 3. Absolute fallback to any senior official in the department
  const fallback = await Employee.findOne({
    departmentId,
    role: {
      $in: [
        'COMMISSIONER',
        'Commissioner',
        'Corporation Commissioner',
        'MINISTER',
        'Minister'
      ]
    }
  }).sort({ role: -1, createdAt: -1 });

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
      const category = await ComplaintCategory.findOne({ code: categoryCode });
      if (category) {
        finalCategoryId = category._id;
        if (!finalDeptId) finalDeptId = category.departmentId;
      }
    }

    if (!finalDeptId && departmentName) {
      const dept = await Department.findOne({ name: { $regex: departmentName, $options: 'i' } });
      if (dept) finalDeptId = dept._id;
    }

    let finalJurisId = jurisdictionId;
    if (!finalJurisId && jurisdictionName) {
      const juris = await Jurisdiction.findOne({ name: { $regex: jurisdictionName, $options: 'i' } });
      if (juris) finalJurisId = juris._id;
    }

    // Auto-assignment & Status setting based on department's first escalation role
    let assignedToId = null;
    let status = 'SUBMITTED';

    if (finalDeptId && finalCategoryId) {
      const category = await ComplaintCategory.findById(finalCategoryId).populate({
        path: 'escalations',
        options: { sort: { level: 1 } }
      });
      
      const escalations = category?.escalations as any[] | undefined;
      if (category && escalations && escalations.length > 0) {
        const firstRole = escalations[0].assigneeTitle;
        const officer = await findEmployeeByEscalationRole(finalDeptId, firstRole, finalJurisId);
        if (officer) {
          assignedToId = officer._id;
          status = 'ASSIGNED';
          console.log(`[AUTO-ASSIGN] Ticket assigned to first level: ${firstRole} (${officer.name})`);
        }
      }
    }

    // Generate a simple ticket number
    const count = await Ticket.countDocuments();
    const ticketNumber = `TN-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

    // Create ticket in database
    let ticket = await Ticket.create({
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
    });

    // Populate relations
    let populatedTicket = await Ticket.findById(ticket._id)
      .populate('citizen', 'name phone')
      .populate('department')
      .populate({
        path: 'category',
        populate: {
          path: 'escalations',
          options: { sort: { level: 1 } }
        }
      })
      .populate({
        path: 'jurisdiction',
        populate: {
          path: 'parent',
          populate: {
            path: 'parent',
            populate: {
              path: 'parent'
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
      populatedTicket = await Ticket.findByIdAndUpdate(
        ticket._id,
        { photo: savedPhotoUrl },
        { new: true }
      )
      .populate('citizen', 'name phone')
      .populate('department')
      .populate({
        path: 'category',
        populate: {
          path: 'escalations',
          options: { sort: { level: 1 } }
        }
      })
      .populate({
        path: 'jurisdiction',
        populate: {
          path: 'parent',
          populate: {
            path: 'parent',
            populate: {
              path: 'parent'
            }
          }
        }
      });
    }

    // Record history
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'created',
      notes: `Ticket submitted by citizen${status === 'ASSIGNED' ? ' and auto-assigned to first responder' : ''}`
    });

    res.status(201).json(formatTicketResponse(populatedTicket));
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

    // Delta of ~7.7 meters
    const delta = 0.00007;

    const category = await ComplaintCategory.findOne({ code: categoryCode as string });
    if (!category) {
      res.json(null);
      return;
    }

    const duplicate = await Ticket.findOne({
      categoryId: category._id,
      status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
      lat: { $gte: latitude - delta, $lte: latitude + delta },
      lng: { $gte: longitude - delta, $lte: longitude + delta }
    })
    .populate('category')
    .populate('jurisdiction');

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
    const existingClaim = await TicketClaim.findOne({ ticketId, citizenId });
    if (existingClaim) {
      res.status(400).json({ error: 'You have already claimed this ticket' });
      return;
    }

    // Add claim sequentially
    await TicketClaim.create({ ticketId, citizenId });
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $inc: { claimCount: 1 } },
      { new: true }
    );
    await TicketHistory.create({
      ticketId,
      action: 'claim_added',
      notes: 'Claim added via duplicate detection or feed'
    });

    if (ticket) {
      let newPriority = 'LOW';
      if (ticket.claimCount >= 15) newPriority = 'CRITICAL';
      else if (ticket.claimCount >= 7) newPriority = 'HIGH';
      else if (ticket.claimCount >= 3) newPriority = 'MEDIUM';

      if (ticket.priority !== newPriority) {
        await Ticket.findByIdAndUpdate(ticketId, { priority: newPriority });
        await TicketHistory.create({
          ticketId,
          action: 'priority_updated_by_claims',
          notes: `Priority automatically upgraded to ${newPriority} due to ${ticket.claimCount} citizen claims.`
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
  if (!ticket) return null;
  let ward = '';
  let district = '';

  const tObj = typeof ticket.toObject === 'function' ? ticket.toObject() : ticket;

  if (tObj.jurisdiction) {
    if (tObj.jurisdiction.level === 'WARD') {
      ward = tObj.jurisdiction.name;
      district = tObj.jurisdiction.parent?.parent?.parent?.name || 
                 tObj.jurisdiction.parent?.parent?.name || 
                 tObj.jurisdiction.parent?.name || 
                 'Chennai';
    } else {
      district = tObj.jurisdiction.name;
    }
  }

  const host = process.env.BACKEND_URL || '';
  const photoPath = tObj.photo;
  const fullPhotoUrl = photoPath ? (photoPath.startsWith('http') ? photoPath : `${host}${photoPath}`) : null;
  
  const proofPhotoPath = tObj.proofPhoto;
  const fullProofPhotoUrl = proofPhotoPath ? (proofPhotoPath.startsWith('http') ? proofPhotoPath : `${host}${proofPhotoPath}`) : null;
  
  const categoryCode = tObj.category?.code || 'N/A';
  const categoryName = tObj.category?.name || 'Uncategorized';
  const departmentName = tObj.department?.name || tObj.category?.department?.name || 'Unknown';
  
  const steps = tObj.category?.escalations?.map((e: any) => ({
    role: e.assigneeTitle,
    label: e.assigneeTitle,
    slaDays: e.slaDays
  })) || [];

  return {
    ...tObj,
    photo: fullPhotoUrl,
    photo_url: fullPhotoUrl,
    proofPhoto: fullProofPhotoUrl,
    category: categoryCode,
    categoryName: categoryName,
    departmentName: departmentName,
    hierarchySteps: steps,
    created_at: tObj.createdAt,
    sla_deadline: tObj.deadline,
    ward: ward || tObj.jurisdiction?.name || '',
    district: district,
    citizen_name: tObj.citizen?.name || 'Anonymous'
  };
};

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

export const bulkUpdateTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, status, priority, notes } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ error: 'IDs array is required' });
      return;
    }

    const data: any = {};
    if (status) data.status = status.toUpperCase();
    if (priority) data.priority = priority.toUpperCase();
    data.updatedAt = new Date();

    await Ticket.updateMany(
      { _id: { $in: ids } },
      { $set: data }
    );

    for (const id of ids) {
      await TicketHistory.create({
        ticketId: id,
        action: status ? `bulk_status_to_${status.toUpperCase()}` : 'bulk_update',
        notes: notes || 'Updated via bulk action.',
        employeeId: req.user?.type === 'employee' ? req.user.id : null
      });
    }

    res.json({ message: `Successfully updated ${ids.length} tickets.` });
  } catch (error) {
    console.error('Bulk Update Error:', error);
    res.status(500).json({ error: 'Failed to update tickets in bulk' });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};

    if (user?.type === 'citizen') {
      const citizen = await Citizen.findById(user.id);
      if (citizen && citizen.isVolunteer && citizen.volunteerWard && req.query.scope === 'ward') {
        const wardJurisdiction = await Jurisdiction.findOne({
          level: 'WARD',
          name: citizen.volunteerWard
        });
        if (wardJurisdiction) {
          query = {
            jurisdictionId: wardJurisdiction.id,
            status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] }
          };
        } else {
          query = { _id: '000000000000000000000000' }; // Empty match
        }
      } else if (req.query.feed === 'true') {
        query = {
          status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'] }
        };
      } else {
        // Query citizen owner OR claims by citizen
        const claims = await TicketClaim.find({ citizenId: user.id }).select('ticketId');
        const claimedTicketIds = claims.map(c => c.ticketId);

        query = {
          $or: [
            { citizenId: user.id },
            { _id: { $in: claimedTicketIds } }
          ]
        };
      }
    } else if (user?.type === 'employee') {
      const scopeConditions: any[] = [];
      
      // Condition A: Explicitly assigned
      scopeConditions.push({ assignedToId: user.id });

      // Condition B: Department + Jurisdiction Scope
      const jurisDeptScope: any = {};
      if (user.departmentId) jurisDeptScope.departmentId = user.departmentId;
      if (user.jurisdictionId) {
        try {
          const descendantIds = await getJurisdictionDescendants(user.jurisdictionId);
          jurisDeptScope.jurisdictionId = {
            $in: [user.jurisdictionId, ...descendantIds]
          };
        } catch (jError) {
          console.error('[GET TICKETS] Failed to fetch jurisdiction descendants:', jError);
          jurisDeptScope.jurisdictionId = user.jurisdictionId;
        }
      }
      if (Object.keys(jurisDeptScope).length > 0) {
        scopeConditions.push(jurisDeptScope);
      }

      query.$or = scopeConditions;
    }

    const tickets = await Ticket.find(query)
      .populate('citizen', 'name phone')
      .populate('department')
      .populate({
        path: 'category',
        populate: {
          path: 'escalations',
          options: { sort: { level: 1 } }
        }
      })
      .populate('jurisdiction')
      .populate('assignedTo', 'name role')
      .populate({
        path: 'history',
        populate: {
          path: 'employee',
          select: 'name role'
        },
        options: { sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 });

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

const STATUS_ORDER = {
  'SUBMITTED': 1,
  'ASSIGNED': 2,
  'IN_PROGRESS': 3,
  'ESCALATED': 4,
  'RESOLVED': 5,
  'CLOSED': 6
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId, notes } = req.body;
    console.log(`[UPDATE TICKET] ID: ${id}, User: ${req.user?.id}, Type: ${req.user?.type}`, req.body);
    
    let employeeId = undefined;
    let isVolunteerUser = false;
    let volunteerName = '';

    const currentTicket = await Ticket.findById(id).populate('assignedTo').populate('jurisdiction');

    if (!currentTicket) {
      console.error(`[UPDATE TICKET ERROR] Ticket not found: ${id}`);
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    if (req.user?.type === 'citizen') {
      const citizen = await Citizen.findById(req.user.id);
      const isOwner = currentTicket.citizenId.toString() === req.user.id;
      const isWardVolunteer = citizen && citizen.isVolunteer && citizen.volunteerWard && currentTicket.jurisdiction && currentTicket.jurisdiction.name === citizen.volunteerWard;

      if (isWardVolunteer) {
        if (status?.toUpperCase() !== 'ESCALATED') {
          console.error(`[UPDATE TICKET ERROR] Volunteer tried non-escalation action`);
          res.status(400).json({ error: 'Volunteers are only permitted to escalate tickets.' });
          return;
        }
        isVolunteerUser = true;
        volunteerName = citizen.name;
      } else if (isOwner) {
        // Citizen can transition to CLOSED, REOPENED or ESCALATED
        const targetStatus = status?.toUpperCase();
        const allowedStatuses = ['CLOSED', 'REOPENED', 'ESCALATED'];
        if (!allowedStatuses.includes(targetStatus)) {
          console.error(`[UPDATE TICKET ERROR] Citizen tried unauthorized status: ${targetStatus}`);
          res.status(400).json({ error: 'Citizens are only permitted to close, reopen, or escalate their tickets.' });
          return;
        }
      } else {
        console.error(`[UPDATE TICKET ERROR] Citizen ${req.user.id} tried to update ticket owned by ${currentTicket.citizenId}`);
        res.status(403).json({ error: 'Forbidden: Only employees, verified volunteers, or the ticket owner can update this ticket.' });
        return;
      }
    } else if (req.user?.type === 'employee') {
      employeeId = req.user.id;
    } else {
      console.error(`[UPDATE TICKET ERROR] Unauthorized user type`);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentStatusVal = currentTicket.status?.toUpperCase() || 'SUBMITTED';
    const newStatus = status?.toUpperCase();

    // Enforce "No Decrease" strict workflow checks (except via RESOLVED or citizen REOPENED)
    if (newStatus && newStatus !== currentStatusVal) {
      const currentRank = STATUS_ORDER[currentStatusVal as keyof typeof STATUS_ORDER] || 0;
      const newRank = STATUS_ORDER[newStatus as keyof typeof STATUS_ORDER] || 0;
      
      if (currentStatusVal !== 'REOPENED' && newRank < currentRank) {
        console.error(`[UPDATE TICKET ERROR] Blocked status decrease from ${currentStatusVal} to ${newStatus}`);
        res.status(400).json({ error: 'Status decrease is not allowed. Downward paths must go through RESOLVED/CLOSED.' });
        return;
      }
    }

    // Check Mandatory Reason Text for Escalation
    if (newStatus === 'ESCALATED' && (!notes || notes.trim() === '')) {
      console.error(`[UPDATE TICKET ERROR] Mandatory notes missing for Escalation.`);
      res.status(400).json({ error: 'Reason/Notes are mandatory for Escalation actions.' });
      return;
    }

    // Check Proof Photo validation at first-touch close (AAE/DSI level resolving or closing)
    const updater = employeeId ? await Employee.findById(employeeId) : null;
    if (updater && (updater.role === 'AAE' || updater.role === 'DSI') && (newStatus === 'RESOLVED' || newStatus === 'CLOSED')) {
      if (!req.body.photo && !req.body.proofPhoto && !req.body.resolution_proof) {
        res.status(400).json({ error: 'Proof photo is mandatory for resolution/closure at AAE and DSI level.' });
        return;
      }
    }

    const data: any = {};
    if (status) data.status = status.toUpperCase();
    if (priority) data.priority = priority.toUpperCase();
    if (assignedToId) data.assignedToId = assignedToId;
    
    // Support department & category transfer reassignments
    const newDeptId = req.body.departmentId || req.body.target_department;
    const newCatId = req.body.categoryId || req.body.target_category;
    
    if (newDeptId) data.departmentId = newDeptId;
    if (newCatId) data.categoryId = newCatId;

    if (newDeptId || newCatId) {
      const activeDeptId = newDeptId || currentTicket.departmentId;
      const activeCatId = newCatId || currentTicket.categoryId;
      
      if (activeDeptId && activeCatId) {
        const category = await ComplaintCategory.findById(activeCatId).populate({
          path: 'escalations',
          options: { sort: { level: 1 } }
        });
        const escalations = category?.escalations as any[] | undefined;
        if (category && escalations && escalations.length > 0) {
          const firstRole = escalations[0].assigneeTitle;
          const officer = await findEmployeeByEscalationRole(
            activeDeptId.toString(),
            firstRole,
            currentTicket.jurisdictionId ? currentTicket.jurisdictionId.toString() : undefined
          );
          if (officer) {
            data.assignedToId = officer._id;
            data.status = 'ASSIGNED';
            console.log(`[TRANSFER] Auto-assigned to first responder of new dept/cat: ${firstRole} (${officer.name})`);
          } else {
            data.assignedToId = null;
            data.status = 'SUBMITTED';
          }
        }
      }
    }

    // Save photo details
    const proofPhotoVal = req.body.proofPhoto || req.body.photo || req.body.resolution_proof;
    if (proofPhotoVal) data.proofPhoto = proofPhotoVal;
    if (req.body.rating !== undefined) data.rating = parseInt(req.body.rating, 10);
    if (req.body.reopenReason) data.reopenReason = req.body.reopenReason;

    // MLA Security & Flagging enforcement
    if (updater && updater.role === 'MLA') {
      if (status || priority || assignedToId || newDeptId || newCatId) {
        res.status(403).json({ error: 'MLA is restricted to VIEW + FLAG only. Cannot change status, priority, department, category, or assignee.' });
        return;
      }
      if (!notes || notes.trim() === '') {
        res.status(400).json({ error: 'Flag notes are mandatory.' });
        return;
      }
      data.updatedAt = new Date();
    }

    // Escalation Moves Exactly One Level Up using the Category Hierarchy
    if (data.status === 'ESCALATED') {
      const category = await ComplaintCategory.findById(currentTicket.categoryId).populate({
        path: 'escalations',
        options: { sort: { level: 1 } }
      });

      const escalations = category?.escalations as any[] | undefined;
      if (category && escalations && escalations.length > 0) {
        const currentRole = currentTicket.assignedTo?.role || '';

        let currentLevelIdx = -1;
        for (let i = 0; i < escalations.length; i++) {
          if (rolesMatch(currentRole, escalations[i].assigneeTitle)) {
            currentLevelIdx = i;
            break;
          }
        }

        const nextIdx = currentLevelIdx + 1;
        if (nextIdx < escalations.length) {
          const nextRole = escalations[nextIdx].assigneeTitle;
          const supervisor = await findEmployeeByEscalationRole(currentTicket.departmentId ? currentTicket.departmentId.toString() : '', nextRole, currentTicket.jurisdictionId ? currentTicket.jurisdictionId.toString() : undefined);
          
          if (supervisor) {
            data.assignedToId = supervisor.id;
            console.log(`[DYNAMIC ESCALATION] Reassigned ticket ${id} to level ${nextIdx+1} (${nextRole}): ${supervisor.name}`);
          }
        } else {
          // Reached end of chain, escalate to Minister
          const minister = await findEmployeeByEscalationRole(currentTicket.departmentId ? currentTicket.departmentId.toString() : '', 'Minister', undefined);
          if (minister) {
            data.assignedToId = minister.id;
            console.log(`[ESCALATION FALLBACK] Reached end of chain. Assigned to Minister: ${minister.name}`);
          }
        }
      }
    }

    // Log Intervention if higher role acts on lower ticket
    let isIntervention = false;
    if (currentTicket.assignedToId && currentTicket.assignedToId.toString() !== employeeId && updater) {
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

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
    .populate('citizen', 'name phone')
    .populate('department')
    .populate({
      path: 'category',
      populate: {
        path: 'escalations',
        options: { sort: { level: 1 } }
      }
    })
    .populate({
      path: 'jurisdiction',
      populate: {
        path: 'parent',
        populate: {
          path: 'parent',
          populate: {
            path: 'parent'
          }
        }
      }
    })
    .populate('assignedTo', 'name role');

    // Record history
    let historyAction = 'updated';
    if (isVolunteerUser) {
      historyAction = 'volunteer_escalation';
    } else if (req.user?.type === 'citizen' && status?.toUpperCase() === 'ESCALATED') {
      historyAction = 'citizen_escalation';
    } else if (updater && updater.role === 'MLA') {
      historyAction = 'MLA_FLAG';
    } else if (updater && updater.role === 'CM' && (req.body.isCmWatching || req.body.action === 'flag' || (notes && notes.startsWith('CM FLAG')))) {
      historyAction = 'CM_FLAG';
    } else if (isIntervention) {
      historyAction = 'intervention_override';
    } else if (status) {
      historyAction = `status_changed_to_${status.toUpperCase()}`;
    }

    await TicketHistory.create({
      ticketId: ticket?.id,
      action: historyAction,
      notes: historyNotes,
      employeeId
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
    const breachedTickets = await Ticket.find({
      status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
      deadline: { $lt: now }
    }).populate('assignedTo').populate('department');

    if (breachedTickets.length === 0) return;

    console.log(`[SLA BREACH ENGINE] Found ${breachedTickets.length} tickets with breached SLA deadlines. Escalating...`);

    for (const ticket of breachedTickets) {
      const category = await ComplaintCategory.findById(ticket.categoryId).populate({
        path: 'escalations',
        options: { sort: { level: 1 } }
      });

      const escalations = category?.escalations as any[] | undefined;
      if (!category || !escalations || escalations.length === 0) continue;

      const currentRole = ticket.assignedTo?.role || '';

      let currentLevelIdx = -1;
      for (let i = 0; i < escalations.length; i++) {
        if (rolesMatch(currentRole, escalations[i].assigneeTitle)) {
          currentLevelIdx = i;
          break;
        }
      }

      const nextIdx = currentLevelIdx + 1;
      if (nextIdx >= escalations.length) continue; // Already at top level

      const nextRole = escalations[nextIdx].assigneeTitle;

      const updateData: any = {
        status: 'ESCALATED',
        updatedAt: new Date()
      };

      let supervisorName = '';
      if (nextRole && ticket.departmentId) {
        const supervisor = await findEmployeeByEscalationRole(ticket.departmentId.toString(), nextRole, ticket.jurisdictionId ? ticket.jurisdictionId.toString() : undefined);
        if (supervisor) {
          updateData.assignedToId = supervisor._id;
          supervisorName = `${supervisor.name} (${nextRole})`;
        } else {
          continue; // No supervisor found
        }
      }

      await Ticket.findByIdAndUpdate(ticket._id, { $set: updateData });

      // Log to history
      await TicketHistory.create({
        ticketId: ticket.id,
        action: 'status_changed_to_ESCALATED',
        notes: `SLA Breached! Auto-escalated from ${currentRole} to ${supervisorName || nextRole || 'Next Level'}.`
      });

      console.log(`[SLA BREACH ENGINE] Ticket ${ticket.ticketNumber} auto-escalated to ${supervisorName || nextRole || 'Next Level'}`);
    }
  } catch (error) {
    console.error('[SLA BREACH ENGINE ERROR]:', error);
  }
};
