import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataPath = path.resolve(__dirname, '../data/tn_jurisdictions.json');

async function main() {
  console.log('--- STARTING MASTER SEED ---');

  // 1. CLEAN EXISTING DATA
  console.log('Cleaning existing database records...');
  await prisma.ticketClaim.deleteMany({});
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.categoryEscalation.deleteMany({});
  await prisma.complaintCategory.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.jurisdiction.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.ticketStateTransition.deleteMany({});
  await prisma.zone.deleteMany({});
  await prisma.citizen.deleteMany({});

  // 2. SEED DEPARTMENTS (Sheet 01)
  console.log('Seeding 43 official departments...');
  const departmentsData = [
    { name: 'Adi Dravidar and Tribal Welfare', slug: 'adi-dravidar-tribal-welfare', primaryDomain: 'Welfare', isCivicFacing: false },
    { name: 'Agriculture', slug: 'agriculture', primaryDomain: 'Agriculture', isCivicFacing: false },
    { name: 'Animal Husbandry, Dairying and Fisheries', slug: 'animal-husbandry', primaryDomain: 'Veterinary/Stray Animals', isCivicFacing: true },
    { name: 'Backward Classes, MBC and Minorities Welfare', slug: 'bc-mbc-minorities-welfare', primaryDomain: 'Welfare', isCivicFacing: false },
    { name: 'Commercial Taxes and Registration', slug: 'commercial-taxes-registration', primaryDomain: 'Registration/Taxes', isCivicFacing: true },
    { name: 'Co-operation, Food and Consumer Protection', slug: 'cooperation-food-consumer', primaryDomain: 'Ration/PDS/Consumer', isCivicFacing: true },
    { name: 'Electricity & Energy Resources', slug: 'electricity', primaryDomain: 'Electricity', isCivicFacing: true },
    { name: 'Environment and Forests', slug: 'environment-forests', primaryDomain: 'Environment/Pollution', isCivicFacing: true },
    { name: 'Finance', slug: 'finance', primaryDomain: 'Finance', isCivicFacing: false },
    { name: 'Handlooms, Handicrafts, Textiles and Khadi', slug: 'handlooms-textiles', primaryDomain: 'Industry', isCivicFacing: false },
    { name: 'Health and Family Welfare', slug: 'health-family-welfare', primaryDomain: 'Health Services', isCivicFacing: true },
    { name: 'Health & Sanitation', slug: 'sanitation', primaryDomain: 'Health Services', isCivicFacing: true },
    { name: 'Higher Education', slug: 'higher-education', primaryDomain: 'Education', isCivicFacing: false },
    { name: 'Highways and Minor Ports', slug: 'highways-minor-ports', primaryDomain: 'Roads (Highways)', isCivicFacing: true },
    { name: 'Home, Prohibition and Excise', slug: 'home-prohibition-excise', primaryDomain: 'Police/Public Safety', isCivicFacing: true },
    { name: 'Housing and Urban Development', slug: 'housing-urban-development', primaryDomain: 'Town Planning/Encroachment', isCivicFacing: true },
    { name: 'Human Resources Management', slug: 'human-resources-mgmt', primaryDomain: 'Admin', isCivicFacing: false },
    { name: 'Industries', slug: 'industries', primaryDomain: 'Industry', isCivicFacing: false },
    { name: 'Information Technology and Digital Services', slug: 'it-digital-services', primaryDomain: 'IT/e-Governance', isCivicFacing: false },
    { name: 'Labour and Employment', slug: 'labour-employment', primaryDomain: 'Labour', isCivicFacing: false },
    { name: 'Law', slug: 'law', primaryDomain: 'Legal', isCivicFacing: false },
    { name: 'Legislative Assembly', slug: 'legislative-assembly', primaryDomain: 'Legislature', isCivicFacing: false },
    { name: 'Micro, Small and Medium Enterprises', slug: 'msme', primaryDomain: 'Industry', isCivicFacing: false },
    { name: 'Miscellaneous Officers, Secretariat', slug: 'misc-secretariat', primaryDomain: 'Admin', isCivicFacing: false },
    { name: 'Mudhalvarin Mugavari (CM Helpline / CMO)', slug: 'mudhalvarin-mugavari', primaryDomain: 'Grievance/CM Cell', isCivicFacing: true },
    { name: 'Municipal Administration and Water Supply', slug: 'municipal-admin-water-supply', primaryDomain: 'Water/Sewerage/Civic', isCivicFacing: true },
    { name: 'Natural Resources', slug: 'natural-resources', primaryDomain: 'Natural Resources', isCivicFacing: false },
    { name: 'Other States Government', slug: 'other-states', primaryDomain: 'Inter-state', isCivicFacing: false },
    { name: 'Planning, Development and Special Initiatives', slug: 'planning-development', primaryDomain: 'Planning', isCivicFacing: false },
    { name: 'Public', slug: 'public', primaryDomain: 'Admin/Protocol', isCivicFacing: false },
    { name: 'Public (Elections)', slug: 'public-elections', primaryDomain: 'Elections', isCivicFacing: false },
    { name: 'Public Works (PWD)', slug: 'public-works', primaryDomain: 'PWD/Buildings', isCivicFacing: true },
    { name: 'Revenue and Disaster Management', slug: 'revenue-disaster-mgmt', primaryDomain: 'Revenue/Land/Certificates', isCivicFacing: true },
    { name: 'Rural Development and Panchayat Raj', slug: 'rural-dev-panchayat-raj', primaryDomain: 'Rural/Panchayat Civic', isCivicFacing: true },
    { name: 'School Education', slug: 'school-education', primaryDomain: 'Education', isCivicFacing: true },
    { name: 'Social Reforms', slug: 'social-reforms', primaryDomain: 'Social', isCivicFacing: false },
    { name: 'Social Welfare and Women Empowerment', slug: 'social-welfare-women', primaryDomain: 'Welfare/Women', isCivicFacing: true },
    { name: 'Special Programme Implementation', slug: 'special-programme-impl', primaryDomain: 'Programmes', isCivicFacing: false },
    { name: 'Tamil Development and Information', slug: 'tamil-dev-information', primaryDomain: 'Culture/Info', isCivicFacing: false },
    { name: 'Tourism, Culture and Religious Endowments', slug: 'tourism-culture-endowments', primaryDomain: 'Tourism', isCivicFacing: false },
    { name: 'Transport', slug: 'transport', primaryDomain: 'Transport/RTO/Bus', isCivicFacing: true },
    { name: 'Water Resources (WRD)', slug: 'water-resources', primaryDomain: 'Water Bodies/Irrigation', isCivicFacing: true },
    { name: 'Welfare of Differently Abled Persons', slug: 'differently-abled-welfare', primaryDomain: 'Welfare', isCivicFacing: false },
    { name: 'Youth Welfare and Sports Development', slug: 'youth-welfare-sports', primaryDomain: 'Sports', isCivicFacing: false }
  ];

  const deptSlugMap = new Map<string, string>(); // slug -> id
  for (const dept of departmentsData) {
    const createdDept = await prisma.department.create({
      data: {
        name: dept.name,
        slug: dept.slug,
        primaryDomain: dept.primaryDomain,
        isCivicFacing: dept.isCivicFacing
      }
    });
    deptSlugMap.set(dept.slug, createdDept.id);
  }
  console.log(`Successfully seeded ${departmentsData.length} departments.`);

  // 3. SEED ROLES (Sheet 02)
  console.log('Seeding 13 platform roles...');
  const rolesData = [
    { code: 'CITIZEN', slug: 'citizen', adminLevel: '—', jurisdictionScope: 'Own tickets only', description: 'Files & tracks own grievances' },
    { code: 'VAO', slug: 'vao', adminLevel: 'Revenue Village', jurisdictionScope: 'Single revenue village', description: 'Village Administrative Officer — lowest revenue handler' },
    { code: 'PANCHAYAT_PRESIDENT', slug: 'panchayat-president', adminLevel: 'Village Panchayat', jurisdictionScope: 'Single village panchayat', description: 'Elected rural local body head (parallel to VAO)' },
    { code: 'BDO', slug: 'bdo', adminLevel: 'Panchayat Union (Block)', jurisdictionScope: 'All villages in the block', description: 'Block Development Officer — rural development' },
    { code: 'TAHSILDAR', slug: 'tahsildar', adminLevel: 'Taluk', jurisdictionScope: 'All firkas/villages in taluk', description: 'Taluk revenue head' },
    { code: 'ZONAL_OFFICER', slug: 'zonal-officer', adminLevel: 'Corporation Zone', jurisdictionScope: 'All wards in the zone', description: 'Urban zonal head (e.g. GCC zone)' },
    { code: 'COMMISSIONER', slug: 'commissioner', adminLevel: 'Corporation/Municipality', jurisdictionScope: 'Entire urban local body', description: 'Municipal executive head' },
    { code: 'RDO', slug: 'rdo', adminLevel: 'Revenue Division', jurisdictionScope: 'All taluks in division', description: 'Revenue Divisional Officer / Sub-Collector' },
    { code: 'COLLECTOR', slug: 'collector', adminLevel: 'District', jurisdictionScope: 'All tickets in the district (urban+rural)', description: 'District Collector — apex district authority' },
    { code: 'MLA', slug: 'mla', adminLevel: 'Assembly Constituency', jurisdictionScope: 'Constituency-level oversight', description: 'Elected legislator — political escalation' },
    { code: 'MINISTER', slug: 'minister', adminLevel: 'Department (statewide)', jurisdictionScope: 'All tickets of their department', description: 'Cabinet minister — department head' },
    { code: 'CM', slug: 'cm', adminLevel: 'State', jurisdictionScope: 'ALL tickets statewide', description: 'Chief Minister — statewide oversight dashboard' },
    { code: 'SUPER_ADMIN', slug: 'super-admin', adminLevel: 'System', jurisdictionScope: 'System-wide (no ticket ownership)', description: 'Creates/manages users, roles, jurisdictions' }
  ];

  for (const role of rolesData) {
    await prisma.role.create({ data: role });
  }
  console.log(`Successfully seeded ${rolesData.length} roles.`);

  // 4. SEED GCC ZONES (Sheet 03)
  console.log('Seeding GCC 15 zones...');
  const zonesData = [
    { zoneNumber: 'I', name: 'Thiruvottiyur', region: 'North', wardFrom: 1, wardTo: 14 },
    { zoneNumber: 'II', name: 'Manali', region: 'North', wardFrom: 15, wardTo: 21 },
    { zoneNumber: 'III', name: 'Madhavaram', region: 'North', wardFrom: 22, wardTo: 33 },
    { zoneNumber: 'IV', name: 'Tondiarpet', region: 'North', wardFrom: 34, wardTo: 48 },
    { zoneNumber: 'V', name: 'Royapuram', region: 'North', wardFrom: 49, wardTo: 63 },
    { zoneNumber: 'VI', name: 'Thiru-Vi-Ka Nagar', region: 'Central', wardFrom: 64, wardTo: 78 },
    { zoneNumber: 'VII', name: 'Ambattur', region: 'Central', wardFrom: 79, wardTo: 93 },
    { zoneNumber: 'VIII', name: 'Anna Nagar', region: 'Central', wardFrom: 94, wardTo: 108 },
    { zoneNumber: 'IX', name: 'Teynampet', region: 'Central', wardFrom: 109, wardTo: 126 },
    { zoneNumber: 'X', name: 'Kodambakkam', region: 'Central', wardFrom: 127, wardTo: 142 },
    { zoneNumber: 'XI', name: 'Valasaravakkam', region: 'South', wardFrom: 143, wardTo: 155 },
    { zoneNumber: 'XII', name: 'Alandur', region: 'South', wardFrom: 156, wardTo: 167 },
    { zoneNumber: 'XIII', name: 'Adyar', region: 'South', wardFrom: 168, wardTo: 182 },
    { zoneNumber: 'XIV', name: 'Perungudi', region: 'South', wardFrom: 183, wardTo: 191 },
    { zoneNumber: 'XV', name: 'Sholinganallur', region: 'South', wardFrom: 192, wardTo: 200 }
  ];

  for (const zone of zonesData) {
    await prisma.zone.create({ data: zone });
  }
  console.log(`Successfully seeded ${zonesData.length} zones.`);

  // 5. SEED COMPLAINT CATEGORIES AND ESCALATIONS (Sheet 06 & 08)
  console.log('Seeding complaint categories and escalation levels...');
  const complaintCategories = [
    { code: 'CAT-WTR', name: 'Water', departmentSlug: 'municipal-admin-water-supply', defaultAssigneeRole: 'WARD_AEO', defaultPriority: 'HIGH' },
    { code: 'CAT-RDC', name: 'Pot Holes (Road)', departmentSlug: 'municipal-admin-water-supply', defaultAssigneeRole: 'WARD_AEO', defaultPriority: 'MEDIUM' },
    { code: 'CAT-ELE', name: 'Electricity', departmentSlug: 'electricity', defaultAssigneeRole: 'LINE_MAN', defaultPriority: 'HIGH' },
    { code: 'CAT-SAN', name: 'Sanitation', departmentSlug: 'sanitation', defaultAssigneeRole: 'DSI', defaultPriority: 'HIGH' }
  ];

  const categoryEscalations = [
    { categoryCode: 'CAT-WTR', escalations: [
      { level: 'L1', assigneeTitle: 'Ward (AEO)', slaDays: 3 },
      { level: 'L2', assigneeTitle: 'Area Engineer', slaDays: 10 },
      { level: 'L3', assigneeTitle: 'Commissioner', slaDays: 20 }
    ]},
    { categoryCode: 'CAT-RDC', escalations: [
      { level: 'L1', assigneeTitle: 'Ward (AEO)', slaDays: 3 },
      { level: 'L2', assigneeTitle: 'Area Engineer', slaDays: 10 },
      { level: 'L3', assigneeTitle: 'Commissioner', slaDays: 20 }
    ]},
    { categoryCode: 'CAT-ELE', escalations: [
      { level: 'L1', assigneeTitle: 'Assistant Area Engineer', slaDays: 5 },
      { level: 'L2', assigneeTitle: 'Area Engineer', slaDays: 10 },
      { level: 'L3', assigneeTitle: 'Minister (Electricity & Energy Resources)', slaDays: 15 }
    ]},
    { categoryCode: 'CAT-SAN', escalations: [
      { level: 'L1', assigneeTitle: 'Division Sanitary Inspector', slaDays: 2 },
      { level: 'L2', assigneeTitle: 'Sanitary Inspector', slaDays: 5 },
      { level: 'L3', assigneeTitle: 'Health Inspector', slaDays: 10 },
      { level: 'L4', assigneeTitle: 'City Health Inspector', slaDays: 15 },
      { level: 'L5', assigneeTitle: 'Department Commissioner', slaDays: 20 },
      { level: 'L6', assigneeTitle: 'Commissioner', slaDays: 25 },
      { level: 'L7', assigneeTitle: 'Minister (Health)', slaDays: 30 }
    ]}
  ];

  const catMap = new Map<string, string>(); // code -> id
  for (const cat of complaintCategories) {
    const deptId = deptSlugMap.get(cat.departmentSlug);
    if (!deptId) {
      console.warn(`Warning: Department slug ${cat.departmentSlug} not found for category ${cat.code}`);
      continue;
    }
    const createdCat = await prisma.complaintCategory.create({
      data: {
        code: cat.code,
        name: cat.name,
        departmentId: deptId,
        defaultAssigneeRole: cat.defaultAssigneeRole,
        defaultPriority: cat.defaultPriority
      }
    });
    catMap.set(cat.code, createdCat.id);
  }

  for (const escGroup of categoryEscalations) {
    const catId = catMap.get(escGroup.categoryCode);
    if (!catId) continue;
    for (const esc of escGroup.escalations) {
      await prisma.categoryEscalation.create({
        data: {
          categoryId: catId,
          level: esc.level,
          assigneeTitle: esc.assigneeTitle,
          slaDays: esc.slaDays
        }
      });
    }
  }
  console.log(`Successfully seeded ${complaintCategories.length} complaint categories with escalation ladders.`);

  // 6. SEED TICKET LIFECYCLE STATE TRANSITIONS (Sheet 07)
  console.log('Seeding ticket state transitions...');
  const lifecycleData = [
    { fromState: 'SUBMITTED', toState: 'ASSIGNED', performedBy: 'Citizen / System', trigger: 'System auto-routes to default assignee role' },
    { fromState: 'ASSIGNED', toState: 'IN_PROGRESS', performedBy: 'Officer', trigger: 'Officer accepts & starts work' },
    { fromState: 'ASSIGNED', toState: 'ASSIGNED', performedBy: 'Officer', trigger: 'Officer reassigns to correct department' },
    { fromState: 'IN_PROGRESS', toState: 'RESOLVED', performedBy: 'Officer', trigger: 'Work done' },
    { fromState: 'IN_PROGRESS', toState: 'ESCALATED', performedBy: 'Officer / System', trigger: 'SLA breach/no-action' },
    { fromState: 'ESCALATED', toState: 'ASSIGNED', performedBy: 'System / Officer', trigger: 'Auto/manual escalation to higher authority' },
    { fromState: 'RESOLVED', toState: 'CLOSED', performedBy: 'Citizen', trigger: 'Citizen confirms satisfied' },
    { fromState: 'RESOLVED', toState: 'REOPENED', performedBy: 'Citizen', trigger: 'Citizen not satisfied with resolution' },
    { fromState: 'REOPENED', toState: 'IN_PROGRESS', performedBy: 'Officer', trigger: 'Goes back to officer' },
    { fromState: 'REOPENED', toState: 'ESCALATED', performedBy: 'Officer', trigger: 'Escalates to higher authority' }
  ];

  for (const trans of lifecycleData) {
    await prisma.ticketStateTransition.create({ data: trans });
  }
  console.log(`Successfully seeded ${lifecycleData.length} transitions.`);

  // 7. SEED JURISDICTIONS FROM JSON FILE
  console.log('Reading jurisdictions file...');
  if (!fs.existsSync(dataPath)) {
    console.error('Jurisdiction JSON file not found at:', dataPath);
    process.exit(1);
  }
  const geoData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log('Creating State Node...');
  const stateNode = await prisma.jurisdiction.create({
    data: {
      level: 'STATE',
      name: 'Tamil Nadu',
      track: 'REVENUE'
    }
  });

  console.log('Creating Districts...');
  const districtMap = new Map<string, string>(); // name -> id
  for (const dist of geoData.districts) {
    const dNode = await prisma.jurisdiction.create({
      data: {
        level: 'DISTRICT',
        name: dist.name,
        parentId: stateNode.id,
        track: 'REVENUE'
      }
    });
    districtMap.set(dist.name, dNode.id);
  }

  // Wards with custom names (Zones I–V Wards 1–43)
  const namedWardsMap: { [key: number]: string } = {
    1: "Kodungaiyur (West)",
    2: "Kodungaiyur (East)",
    3: "Dr. Radhakrishnan Nagar (North)",
    4: "Cheriyan Nagar (North)",
    5: "Jeeva Nagar (North)",
    6: "Cheriyan Nagar (South)",
    7: "Jeeva Nagar (South)",
    8: "Korukkupet",
    9: "Mottai Thottam",
    10: "Kumarasamy Nagar (South)",
    11: "Dr. Radhakrishnan Nagar (South)",
    12: "Kumarasamy Nagar (North)",
    13: "Vijayaragavalu Nagar (West)",
    14: "Tondiarpet",
    15: "Sanjeevirayanpet",
    16: "Grace Garden",
    17: "Ma-Po-Si Nagar",
    18: "Royapuram",
    19: "Singarathottam",
    20: "Narayanappa Thottam",
    21: "Old Washermenpet",
    22: "Meenakshiammanpet",
    23: "Kondithope",
    24: "Sevenwells (North)",
    25: "Amman Koil",
    26: "Muthialpet",
    27: "Vallalseethakathi Nagar",
    28: "Kachaleeswarar Nagar",
    29: "Sevenwells (South)",
    30: "Sowcarpet",
    31: "Basin Bridge",
    32: "Vyasarpet (South)",
    33: "Vyasarpet (North)",
    34: "Perambur (North)",
    35: "Perambur (East)",
    36: "Elango Nagar",
    37: "Perambur (South)",
    38: "Thiru-Vi-Ka Nagar",
    39: "Wadia Nagar",
    40: "Dr. Sathyavanimuthu Nagar",
    41: "Pulianthope",
    42: "Dr. Besant Nagar",
    43: "Pedhunayakanpet"
  };

  console.log('Creating Blocks and Rural Wards...');
  let blockCount = 0;
  let ruralWardCount = 0;
  for (const [district, blocks] of Object.entries(geoData.blocks)) {
    const parentId = districtMap.get(district) || districtMap.get(district.replace(' (former district)', ''));
    if (!parentId) continue;
    
    for (const block of blocks as string[]) {
      const blockNode = await prisma.jurisdiction.create({
        data: {
          level: 'BLOCK',
          name: block.replace('(part)', '').trim(),
          parentId,
          track: 'RURAL'
        }
      });
      blockCount++;

      // Generate 15 generic wards for each block
      for (let i = 1; i <= 15; i++) {
        await prisma.jurisdiction.create({
          data: {
            level: 'WARD',
            name: `Ward ${i}`,
            parentId: blockNode.id,
            track: 'RURAL'
          }
        });
        ruralWardCount++;
      }
    }
  }

  console.log('Creating Assembly Constituencies...');
  let acCount = 0;
  for (const ac of geoData.assemblyConstituencies) {
    let parentId = districtMap.get(ac.district);
    if (!parentId) parentId = stateNode.id;

    await prisma.jurisdiction.create({
      data: {
        level: 'CONSTITUENCY',
        name: ac.name,
        parentId,
        track: 'REVENUE'
      }
    });
    acCount++;
  }

  console.log('Creating Corporations and Urban Wards...');
  let corpCount = 0;
  let urbanWardCount = 0;

  if (geoData.corporations) {
    for (const corp of geoData.corporations) {
      let parentId = districtMap.get(corp.district);
      if (!parentId && corp.district === 'Chennai') parentId = districtMap.get('Chennai');
      if (!parentId) parentId = stateNode.id;

      const corpNode = await prisma.jurisdiction.create({
        data: {
          level: 'CORPORATION',
          name: corp.name,
          parentId,
          track: 'URBAN'
        }
      });
      corpCount++;

      if (corp.name === 'Greater Chennai Corporation') {
        // Seed exact Zones according to Sheet 03
        for (const zone of zonesData) {
          const zoneNode = await prisma.jurisdiction.create({
            data: {
              level: 'ZONE',
              name: `Zone ${zone.zoneNumber}: ${zone.name}`,
              parentId: corpNode.id,
              track: 'URBAN'
            }
          });

          // Generate wards in this range
          for (let i = zone.wardFrom; i <= zone.wardTo; i++) {
            const wardName = namedWardsMap[i] ? `Ward ${i}: ${namedWardsMap[i]}` : `Ward ${i}`;
            await prisma.jurisdiction.create({
              data: {
                level: 'WARD',
                name: wardName,
                parentId: zoneNode.id,
                track: 'URBAN'
              }
            });
            urbanWardCount++;
          }
        }
      } else {
        // Other corporations
        for (let i = 1; i <= corp.wardCount; i++) {
          await prisma.jurisdiction.create({
            data: {
              level: 'WARD',
              name: `Ward ${i}`,
              parentId: corpNode.id,
              track: 'URBAN'
            }
          });
          urbanWardCount++;
        }
      }
    }
  }

  console.log('Creating Municipalities...');
  let muniCount = 0;
  if (geoData.municipalities) {
    for (const muni of geoData.municipalities) {
      let parentId = districtMap.get(muni.district) || stateNode.id;

      const muniNode = await prisma.jurisdiction.create({
        data: {
          level: 'MUNICIPALITY',
          name: muni.name,
          parentId,
          track: 'URBAN'
        }
      });
      muniCount++;

      for (let i = 1; i <= muni.wardCount; i++) {
        await prisma.jurisdiction.create({
          data: {
            level: 'WARD',
            name: `Ward ${i}`,
            parentId: muniNode.id,
            track: 'URBAN'
          }
        });
        urbanWardCount++;
      }
    }
  }

  // 8. SEED DEFAULT ADMIN / EMPLOYEE USERS
  console.log('Seeding administrative and employee users...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Grab nodes for assignment
  const chennaiDistrict = await prisma.jurisdiction.findFirst({ where: { level: 'DISTRICT', name: 'Chennai' } });
  const blockNode = await prisma.jurisdiction.findFirst({ where: { level: 'BLOCK' } });
  const wardNode = await prisma.jurisdiction.findFirst({ where: { level: 'WARD', parent: { level: 'ZONE' } } }); // Chennai Ward
  const constNode = await prisma.jurisdiction.findFirst({ where: { level: 'CONSTITUENCY' } });

  // Map departments to variables
  const maDept = await prisma.department.findUnique({ where: { slug: 'municipal-admin-water-supply' } });
  const energyDept = await prisma.department.findUnique({ where: { slug: 'electricity' } });
  const sanitationDept = await prisma.department.findUnique({ where: { slug: 'sanitation' } });
  const revDept = await prisma.department.findUnique({ where: { slug: 'revenue-disaster-mgmt' } });

  const defaultUsers = [
    {
      username: 'admin',
      name: 'Super Admin',
      category: 'Administrative Officer',
      role: 'SUPER_ADMIN',
      jurisdictionId: stateNode.id,
    },
    {
      username: 'cm_admin',
      name: 'Chief Minister',
      category: 'Elected Representative',
      role: 'CM',
      jurisdictionId: stateNode.id,
    },
    {
      username: 'minister_admin',
      name: 'Municipal Minister',
      category: 'Elected Representative',
      role: 'MINISTER',
      departmentId: maDept?.id,
      jurisdictionId: stateNode.id,
    },
    {
      username: 'collector_admin',
      name: 'Chennai District Collector',
      category: 'Administrative Officer',
      role: 'COLLECTOR',
      jurisdictionId: chennaiDistrict?.id,
    },
    {
      username: 'mla_admin',
      name: 'Constituency MLA',
      category: 'Elected Representative',
      role: 'MLA',
      jurisdictionId: constNode?.id,
    },
    {
      username: 'bdo_admin',
      name: 'Block Development Officer',
      category: 'Administrative Officer',
      role: 'BDO',
      jurisdictionId: blockNode?.id,
    },
    {
      username: 'vao_admin',
      name: 'Village Administrative Officer',
      category: 'Administrative Officer',
      role: 'VAO',
      jurisdictionId: blockNode ? (await prisma.jurisdiction.findFirst({ where: { level: 'WARD', parentId: blockNode.id } }))?.id : undefined,
    },
    {
      username: 'zonal_admin',
      name: 'Zonal Officer',
      category: 'Administrative Officer',
      role: 'ZONAL_OFFICER',
      departmentId: maDept?.id,
      jurisdictionId: wardNode ? (await prisma.jurisdiction.findUnique({ where: { id: wardNode.parentId! } }))?.id : undefined,
    },
    {
      username: 'comm_admin',
      name: 'Corporation Commissioner',
      category: 'Administrative Officer',
      role: 'COMMISSIONER',
      departmentId: maDept?.id,
      jurisdictionId: wardNode ? (await prisma.jurisdiction.findFirst({ where: { level: 'CORPORATION' } }))?.id : undefined,
    },
    {
      username: 'rdo_admin',
      name: 'Revenue Divisional Officer',
      category: 'Administrative Officer',
      role: 'RDO',
      departmentId: revDept?.id,
      jurisdictionId: chennaiDistrict?.id,
    },
    {
      username: 'tah_admin',
      name: 'Taluk Tahsildar',
      category: 'Administrative Officer',
      role: 'TAHSILDAR',
      departmentId: revDept?.id,
      jurisdictionId: chennaiDistrict?.id,
    },
    {
      username: 'pres_admin',
      name: 'Panchayat President',
      category: 'Elected Representative',
      role: 'PANCHAYAT_PRESIDENT',
      jurisdictionId: blockNode?.id,
    },
    // New Escalation Roles
    {
      username: 'ward_aeo',
      name: 'Ward (AEO)',
      category: 'Field Officer',
      role: 'WARD_AEO',
      departmentId: maDept?.id,
      jurisdictionId: wardNode?.id,
    },
    {
      username: 'line_man',
      name: 'Line Man',
      category: 'Field Officer',
      role: 'LINE_MAN',
      departmentId: energyDept?.id,
      jurisdictionId: wardNode?.id,
    },
    {
      username: 'dsi_admin',
      name: 'Division Sanitary Inspector (DSI)',
      category: 'Field Officer',
      role: 'DSI',
      departmentId: sanitationDept?.id,
      jurisdictionId: wardNode?.id,
    },
    {
      username: 'area_engineer',
      name: 'Area Engineer',
      category: 'Department Official',
      role: 'AREA_ENGINEER',
      departmentId: maDept?.id,
    }
  ];

  for (const user of defaultUsers) {
    await prisma.employee.create({
      data: {
        username: user.username,
        password: passwordHash,
        name: user.name,
        category: user.category,
        role: user.role,
        departmentId: user.departmentId || null,
        jurisdictionId: user.jurisdictionId || null
      }
    });
    console.log(`Created employee: ${user.username} / admin123 [${user.role}]`);
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  console.log(`Departments: ${departmentsData.length}`);
  console.log(`Roles: ${rolesData.length}`);
  console.log(`Zones: ${zonesData.length}`);
  console.log(`Complaint Categories: ${complaintCategories.length}`);
  console.log(`Escalation Levels Seeded: ${complaintCategories.length * 4}`);
  console.log(`Transitions: ${lifecycleData.length}`);
  console.log(`Districts: ${geoData.districts.length}`);
  console.log(`Blocks: ${blockCount}`);
  console.log(`Assembly Constituencies: ${acCount}`);
  console.log(`Corporations: ${corpCount}`);
  console.log(`Municipalities: ${muniCount}`);
  console.log(`Rural Wards Generated: ${ruralWardCount}`);
  console.log(`Urban Wards Generated: ${urbanWardCount}`);
  console.log(`Total Employees created: ${defaultUsers.length}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
