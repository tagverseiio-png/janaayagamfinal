import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Build Spec v3 users and roles...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Ensure core departments exist
  const depts = [
    { name: 'Electricity & Energy Resources', slug: 'electricity' },
    { name: 'Health & Sanitation', slug: 'sanitation' },
    { name: 'Water (TWAD/Metro Water)', slug: 'water' },
    { name: 'PWD / Roads', slug: 'roads' }
  ];

  const deptMap: Record<string, string> = {}; // name -> id
  for (const d of depts) {
    let record = await prisma.department.findUnique({ where: { name: d.name } });
    if (!record) {
      record = await prisma.department.create({
        data: { name: d.name, slug: d.slug, isCivicFacing: true }
      });
    }
    deptMap[d.name] = record.id;
  }
  console.log('Departments seeded/verified.');

  // 2. Fetch or create crucial Jurisdictions
  let state = await prisma.jurisdiction.findFirst({ where: { level: 'STATE' } });
  if (!state) {
    state = await prisma.jurisdiction.create({ data: { level: 'STATE', name: 'Tamil Nadu' } });
  }

  let chennai = await prisma.jurisdiction.findFirst({ where: { level: 'DISTRICT', name: 'Chennai' } });
  if (!chennai) {
    chennai = await prisma.jurisdiction.create({
      data: { level: 'DISTRICT', name: 'Chennai', parentId: state.id }
    });
  }

  let mylaporeConstituency = await prisma.jurisdiction.findFirst({
    where: { level: 'CONSTITUENCY', name: 'Mylapore' }
  });
  if (!mylaporeConstituency) {
    mylaporeConstituency = await prisma.jurisdiction.create({
      data: { level: 'CONSTITUENCY', name: 'Mylapore', parentId: chennai.id }
    });
  }

  let mylaporeSection = await prisma.jurisdiction.findFirst({
    where: { level: 'WARD', name: 'Mylapore Section' }
  });
  if (!mylaporeSection) {
    mylaporeSection = await prisma.jurisdiction.create({
      data: { level: 'WARD', name: 'Mylapore Section', parentId: mylaporeConstituency.id }
    });
  }

  let chennaiSouthArea = await prisma.jurisdiction.findFirst({
    where: { level: 'TALUK', name: 'Chennai South Area' }
  });
  if (!chennaiSouthArea) {
    chennaiSouthArea = await prisma.jurisdiction.create({
      data: { level: 'TALUK', name: 'Chennai South Area', parentId: chennai.id }
    });
  }

  let gcc = await prisma.jurisdiction.findFirst({
    where: { level: 'CORPORATION', name: 'Greater Chennai Corporation' }
  });
  if (!gcc) {
    gcc = await prisma.jurisdiction.create({
      data: { level: 'CORPORATION', name: 'Greater Chennai Corporation', parentId: chennai.id }
    });
  }

  let zone4 = await prisma.jurisdiction.findFirst({
    where: { level: 'ZONE', name: 'Zone 4' }
  });
  if (!zone4) {
    zone4 = await prisma.jurisdiction.create({
      data: { level: 'ZONE', name: 'Zone 4', parentId: gcc.id }
    });
  }

  let division14 = await prisma.jurisdiction.findFirst({
    where: { level: 'BLOCK', name: 'Division 14' }
  });
  if (!division14) {
    division14 = await prisma.jurisdiction.create({
      data: { level: 'BLOCK', name: 'Division 14', parentId: zone4.id }
    });
  }

  let ward1 = await prisma.jurisdiction.findFirst({
    where: { level: 'WARD', name: 'Ward 1: Kodungaiyur (W)' }
  });
  if (!ward1) {
    ward1 = await prisma.jurisdiction.create({
      data: { level: 'WARD', name: 'Ward 1: Kodungaiyur (W)', parentId: division14.id }
    });
  }

  console.log('Jurisdictions seeded/verified.');

  // 3. Seed Complaint Categories
  const categories = [
    { code: 'CAT-ELE', name: 'Electricity Failure', departmentId: deptMap['Electricity & Energy Resources'], defaultAssigneeRole: 'AAE', defaultPriority: 'MEDIUM' },
    { code: 'CAT-SAN', name: 'Sanitation Issue', departmentId: deptMap['Health & Sanitation'], defaultAssigneeRole: 'DSI', defaultPriority: 'MEDIUM' },
    { code: 'CAT-WTR', name: 'Water Issue', departmentId: deptMap['Water (TWAD/Metro Water)'], defaultAssigneeRole: 'Ward Officer', defaultPriority: 'MEDIUM' },
    { code: 'CAT-RDC', name: 'Pot Holes (Road)', departmentId: deptMap['PWD / Roads'], defaultAssigneeRole: 'Ward Officer', defaultPriority: 'MEDIUM' }
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    let rec = await prisma.complaintCategory.findUnique({ where: { code: cat.code } });
    if (!rec) {
      rec = await prisma.complaintCategory.create({ data: cat });
    }
    categoryMap[cat.code] = rec.id;
  }
  
  // Seed Escalations
  await prisma.categoryEscalation.deleteMany({});
  
  // Electricity Escalations
  if (categoryMap['CAT-ELE']) {
    await prisma.categoryEscalation.createMany({
      data: [
        { categoryId: categoryMap['CAT-ELE'], level: 'L1', assigneeTitle: 'Assistant Area Engineer', slaDays: 2 },
        { categoryId: categoryMap['CAT-ELE'], level: 'L2', assigneeTitle: 'Area Engineer', slaDays: 4 },
        { categoryId: categoryMap['CAT-ELE'], level: 'L3', assigneeTitle: 'Minister', slaDays: 7 }
      ]
    });
  }

  // Sanitation Escalations
  if (categoryMap['CAT-SAN']) {
    await prisma.categoryEscalation.createMany({
      data: [
        { categoryId: categoryMap['CAT-SAN'], level: 'L1', assigneeTitle: 'Division Sanitary Inspector', slaDays: 1 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L2', assigneeTitle: 'Sanitary Inspector', slaDays: 2 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L3', assigneeTitle: 'Health Inspector', slaDays: 3 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L4', assigneeTitle: 'City Health Inspector', slaDays: 4 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L5', assigneeTitle: 'Department Commissioner', slaDays: 5 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L6', assigneeTitle: 'Commissioner', slaDays: 7 },
        { categoryId: categoryMap['CAT-SAN'], level: 'L7', assigneeTitle: 'Minister', slaDays: 10 }
      ]
    });
  }
  
  console.log('Categories & Escalations seeded.');

  // 4. Seed Employee/Official Accounts
  const employees = [
    {
      username: 'cm_admin',
      name: 'C. Joseph Vijay',
      category: 'Elected Representative',
      role: 'CM',
      departmentId: null,
      jurisdictionId: state.id
    },
    {
      username: 'mla_mylapore',
      name: 'Thiru P. Venkataramanan',
      category: 'Elected Representative',
      role: 'MLA',
      departmentId: null,
      jurisdictionId: mylaporeConstituency.id
    },
    {
      username: 'minister_electricity',
      name: 'C. T. R. Nirmal Kumar',
      category: 'Elected Representative',
      role: 'Minister',
      departmentId: deptMap['Electricity & Energy Resources'],
      jurisdictionId: state.id
    },
    {
      username: 'minister_health',
      name: 'Dr. K.G. Arunraj',
      category: 'Elected Representative',
      role: 'Minister',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: state.id
    },
    {
      username: 'aae_electricity',
      name: 'Er. S. Karthikeyan',
      category: 'Department Official',
      role: 'AAE',
      departmentId: deptMap['Electricity & Energy Resources'],
      jurisdictionId: mylaporeSection.id
    },
    {
      username: 'area_engineer',
      name: 'Er. R. Mohanraj',
      category: 'Department Official',
      role: 'AE',
      departmentId: deptMap['Electricity & Energy Resources'],
      jurisdictionId: chennaiSouthArea.id
    },
    {
      username: 'dsi_admin',
      name: 'M. Saravanan',
      category: 'Department Official',
      role: 'DSI',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: ward1.id
    },
    {
      username: 'si_admin',
      name: 'K. Priyadharshini',
      category: 'Department Official',
      role: 'SI',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: division14.id
    },
    {
      username: 'hi_admin',
      name: 'D. Ramesh Babu',
      category: 'Department Official',
      role: 'HI',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: zone4.id
    },
    {
      username: 'chi_admin',
      name: 'Dr. S. Lakshmi Narayanan',
      category: 'Department Official',
      role: 'CHI',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: chennai.id
    },
    {
      username: 'dept_comm_admin',
      name: 'T. Vijayakumar, I.A.S.',
      category: 'Administrative Officer',
      role: 'Department Commissioner',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: state.id
    },
    {
      username: 'comm_admin',
      name: 'R. Anandhi, I.A.S.',
      category: 'Administrative Officer',
      role: 'Corporation Commissioner',
      departmentId: deptMap['Health & Sanitation'],
      jurisdictionId: gcc.id
    }
  ];

  // Clean old versions of these users to prevent unique constraint failures
  const usernames = employees.map(e => e.username);
  await prisma.employee.deleteMany({
    where: { username: { in: usernames } }
  });

  const seededEmployees: Record<string, string> = {}; // username -> id
  for (const emp of employees) {
    const record = await prisma.employee.create({
      data: {
        username: emp.username,
        name: emp.name,
        category: emp.category,
        role: emp.role,
        password: passwordHash,
        departmentId: emp.departmentId,
        jurisdictionId: emp.jurisdictionId
      }
    });
    seededEmployees[emp.username] = record.id;
    console.log(`Seeded user: ${emp.username} / admin123`);
  }

  // 5. Seed Field Workers under AAE
  const workers = [
    { username: 'worker_gopal', name: 'Gopal', phone: '9876500001' },
    { username: 'worker_ramesh', name: 'Ramesh', phone: '9876500002' },
    { username: 'worker_anbarasan', name: 'Anbarasan', phone: '9876500003' },
    { username: 'worker_murugan', name: 'Murugan', phone: '9876500004' },
    { username: 'worker_selvam', name: 'Selvam', phone: '9876500005' },
    { username: 'worker_velu', name: 'Velu', phone: '9876500006' }
  ];

  await prisma.employee.deleteMany({ where: { username: { in: workers.map(w => w.username) } } });
  for (const w of workers) {
    await prisma.employee.create({
      data: {
        username: w.username,
        name: w.name,
        phone: w.phone,
        password: passwordHash,
        category: 'Field Worker',
        role: 'Field Worker',
        departmentId: deptMap['Electricity & Energy Resources'],
        jurisdictionId: mylaporeSection.id
      }
    });
    console.log(`Seeded AAE field worker: ${w.username}`);
  }

  // 6. Seed Citizens and Tickets
  let citizen = await prisma.citizen.findUnique({ where: { phone: '9876543210' } });
  if (!citizen) {
    citizen = await prisma.citizen.create({
      data: {
        phone: '9876543210',
        name: 'Demo Citizen',
        district: 'Chennai',
        isVolunteer: true,
        volunteerWard: 'Mylapore Section'
      }
    });
  }

  // Clear demo tickets to keep clean
  await prisma.ticketClaim.deleteMany({});
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});

  const ticketTemplates = [
    {
      title: 'Transformer Sparking on Luz Church Road',
      description: 'The local transformer is sparking heavily since afternoon, causing frequent power cuts in Mylapore.',
      categoryCode: 'CAT-ELE',
      deptName: 'Electricity & Energy Resources',
      status: 'ASSIGNED',
      priority: 'CRITICAL',
      assignedToUser: 'aae_electricity',
      daysAgo: 2,
      claimCount: 8,
      jurisId: mylaporeSection.id
    },
    {
      title: 'Sewage Overflow outside Mylapore Club',
      description: 'Grave sewage leak on the main road, making it impossible for pedestrians to walk. Strong foul smell.',
      categoryCode: 'CAT-SAN',
      deptName: 'Health & Sanitation',
      status: 'SUBMITTED',
      priority: 'HIGH',
      assignedToUser: 'dsi_admin',
      daysAgo: 5,
      claimCount: 12,
      jurisId: ward1.id
    },
    {
      title: 'Power Line snapped on Kutchery Road',
      description: 'High voltage overhead wire snapped and is lying on the wet pavement. High hazard risk!',
      categoryCode: 'CAT-ELE',
      deptName: 'Electricity & Energy Resources',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      assignedToUser: 'aae_electricity',
      daysAgo: 0,
      claimCount: 16,
      jurisId: mylaporeSection.id
    },
    {
      title: 'Garbage piling up near Kapaleeshwarar Tank',
      description: 'Solid waste and plastic bins overflowing, attracting dogs and mosquitoes. Needs immediate clearance.',
      categoryCode: 'CAT-SAN',
      deptName: 'Health & Sanitation',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      assignedToUser: 'dsi_admin',
      daysAgo: 9,
      claimCount: 4,
      jurisId: ward1.id
    },
    {
      title: 'Street Light out of order near CIT Colony',
      description: 'Multiple streetlights in the 2nd cross street are dark for over a week, causing safety concerns.',
      categoryCode: 'CAT-ELE',
      deptName: 'Electricity & Energy Resources',
      status: 'RESOLVED',
      priority: 'LOW',
      assignedToUser: 'aae_electricity',
      daysAgo: 12,
      claimCount: 2,
      jurisId: mylaporeSection.id
    },
    {
      title: 'Taluk Road Pot Holes',
      description: 'Deep potholes on the main highway corridor causing traffic blockages and minor bike slips.',
      categoryCode: 'CAT-RDC',
      deptName: 'PWD / Roads',
      status: 'SUBMITTED',
      priority: 'HIGH',
      assignedToUser: null,
      daysAgo: 22,
      claimCount: 32,
      jurisId: chennaiSouthArea.id
    },
    {
      title: 'Sanitation Leakage in Kodungaiyur division',
      description: 'Overflowing open drains flooding the residential street. Blockage in the primary sewer pipeline.',
      categoryCode: 'CAT-SAN',
      deptName: 'Health & Sanitation',
      status: 'ESCALATED',
      priority: 'CRITICAL',
      assignedToUser: 'si_admin',
      daysAgo: 16,
      claimCount: 22,
      jurisId: division14.id
    },
    {
      title: 'Drainage blockage at Zone 4 health complex',
      description: 'Blockage in commercial drainage lines near the local medical center. Threat of waterborne diseases.',
      categoryCode: 'CAT-SAN',
      deptName: 'Health & Sanitation',
      status: 'ESCALATED',
      priority: 'CRITICAL',
      assignedToUser: 'hi_admin',
      daysAgo: 35,
      claimCount: 41,
      jurisId: zone4.id
    }
  ];

  // Generate 10 more generic tickets to total 18 tickets
  for (let i = 1; i <= 10; i++) {
    const isEle = i % 2 === 0;
    ticketTemplates.push({
      title: isEle ? `Loose Electrical Cables - Scenario ${i}` : `Debris Accumulation - Spot ${i}`,
      description: isEle 
        ? `Overhead wires hanging low posing danger to heavy vehicles near spot number ${i}.`
        : `Debris from construction piled on roadside blocking the corner lane near spot ${i}.`,
      categoryCode: isEle ? 'CAT-ELE' : 'CAT-SAN',
      deptName: isEle ? 'Electricity & Energy Resources' : 'Health & Sanitation',
      status: i < 4 ? 'SUBMITTED' : i < 7 ? 'ASSIGNED' : 'RESOLVED',
      priority: i < 3 ? 'CRITICAL' : i < 6 ? 'HIGH' : 'MEDIUM',
      assignedToUser: isEle ? 'aae_electricity' : 'dsi_admin',
      daysAgo: i * 3,
      claimCount: i + 1,
      jurisId: isEle ? mylaporeSection.id : ward1.id
    });
  }

  for (let idx = 0; idx < ticketTemplates.length; idx++) {
    const tNode = ticketTemplates[idx];
    const ticketNumber = `TN-${new Date().getFullYear()}-${(idx + 1).toString().padStart(6, '0')}`;
    const creationDate = new Date(Date.now() - tNode.daysAgo * 24 * 60 * 60 * 1000);
    const deadlineDate = new Date(creationDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 48h SLA

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: tNode.title,
        description: tNode.description,
        status: tNode.status,
        priority: tNode.priority,
        channel: 'WEB',
        lat: 13.0827 + (Math.random() - 0.5) * 0.05,
        lng: 80.2707 + (Math.random() - 0.5) * 0.05,
        citizenId: citizen.id,
        departmentId: deptMap[tNode.deptName] || null,
        categoryId: categoryMap[tNode.categoryCode] || null,
        jurisdictionId: tNode.jurisId,
        assignedToId: tNode.assignedToUser ? seededEmployees[tNode.assignedToUser] : null,
        createdAt: creationDate,
        updatedAt: creationDate,
        deadline: deadlineDate,
        claimCount: tNode.claimCount
      }
    });

    // Seed history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'created',
        notes: 'Ticket registered by citizen',
        createdAt: creationDate
      }
    });

    if (tNode.status !== 'SUBMITTED') {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          action: tNode.status === 'RESOLVED' ? 'status_changed_to_RESOLVED' : 'status_changed_to_' + tNode.status,
          notes: `Updated status to ${tNode.status}`,
          createdAt: new Date(creationDate.getTime() + 1 * 60 * 60 * 1000)
        }
      });
    }

    // Seed mock claims
    for (let c = 0; c < tNode.claimCount; c++) {
      const mockPhone = `98766${idx.toString().padStart(2, '0')}${c.toString().padStart(3, '0')}`;
      let mockCit = await prisma.citizen.findUnique({ where: { phone: mockPhone } });
      if (!mockCit) {
        mockCit = await prisma.citizen.create({
          data: { phone: mockPhone, name: `Mock Citizen ${idx}-${c}` }
        });
      }
      try {
        await prisma.ticketClaim.create({
          data: { ticketId: ticket.id, citizenId: mockCit.id, createdAt: creationDate }
        });
      } catch (err) {}
    }
  }

  console.log(`Successfully seeded ${ticketTemplates.length} demo tickets.`);
  console.log('Master Seeding Complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
