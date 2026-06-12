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
    let record = await prisma.department.findFirst({ 
      where: { 
        OR: [
          { name: d.name },
          { slug: d.slug }
        ]
      } 
    });
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

  // Water Escalations
  if (categoryMap['CAT-WTR']) {
    await prisma.categoryEscalation.createMany({
      data: [
        { categoryId: categoryMap['CAT-WTR'], level: 'L1', assigneeTitle: 'Ward Officer', slaDays: 2 },
        { categoryId: categoryMap['CAT-WTR'], level: 'L2', assigneeTitle: 'Assistant Engineer', slaDays: 5 },
        { categoryId: categoryMap['CAT-WTR'], level: 'L3', assigneeTitle: 'Commissioner', slaDays: 10 }
      ]
    });
  }

  // Roads Escalations
  if (categoryMap['CAT-RDC']) {
    await prisma.categoryEscalation.createMany({
      data: [
        { categoryId: categoryMap['CAT-RDC'], level: 'L1', assigneeTitle: 'Ward Officer', slaDays: 2 },
        { categoryId: categoryMap['CAT-RDC'], level: 'L2', assigneeTitle: 'Assistant Engineer', slaDays: 5 },
        { categoryId: categoryMap['CAT-RDC'], level: 'L3', assigneeTitle: 'District Collector', slaDays: 10 }
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

  console.log('Seeded employees and field workers.');
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
