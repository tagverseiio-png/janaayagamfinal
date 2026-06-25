import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Department from './models/Department';
import Jurisdiction from './models/Jurisdiction';
import ComplaintCategory from './models/ComplaintCategory';
import CategoryEscalation from './models/CategoryEscalation';
import Employee from './models/Employee';
import Citizen from './models/Citizen';
import Role from './models/Role';
import Zone from './models/Zone';
import TicketStateTransition from './models/TicketStateTransition';
import PincodeMapping from './models/PincodeMapping';
import Ticket from './models/Ticket';
import TicketHistory from './models/TicketHistory';
import TicketClaim from './models/TicketClaim';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jananayagam';

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  console.log('Cleaning all collections...');
  await TicketHistory.deleteMany({});
  await TicketClaim.deleteMany({});
  await Ticket.deleteMany({});
  await Employee.deleteMany({});
  await Citizen.deleteMany({});
  await CategoryEscalation.deleteMany({});
  await ComplaintCategory.deleteMany({});
  await Department.deleteMany({});
  await Jurisdiction.deleteMany({});
  await Role.deleteMany({});
  await Zone.deleteMany({});
  await TicketStateTransition.deleteMany({});
  await PincodeMapping.deleteMany({});

  console.log('Seeding roles metadata...');
  await Role.create([
    { code: 'AAE', slug: 'aae', adminLevel: 'WARD', jurisdictionScope: 'WARD', description: 'Assistant Area Engineer' },
    { code: 'AE', slug: 'ae', adminLevel: 'TALUK', jurisdictionScope: 'TALUK', description: 'Area Engineer' },
    { code: 'DSI', slug: 'dsi', adminLevel: 'WARD', jurisdictionScope: 'WARD', description: 'Division Sanitary Inspector' },
    { code: 'SI', slug: 'si', adminLevel: 'BLOCK', jurisdictionScope: 'BLOCK', description: 'Sanitary Inspector' },
    { code: 'HI', slug: 'hi', adminLevel: 'ZONE', jurisdictionScope: 'ZONE', description: 'Health Inspector' },
    { code: 'CHI', slug: 'chi', adminLevel: 'DISTRICT', jurisdictionScope: 'DISTRICT', description: 'City Health Inspector' },
    { code: 'MLA', slug: 'mla', adminLevel: 'CONSTITUENCY', jurisdictionScope: 'CONSTITUENCY', description: 'Member of Legislative Assembly' },
    { code: 'MINISTER', slug: 'minister', adminLevel: 'STATE', jurisdictionScope: 'STATE', description: 'Cabinet Minister' },
    { code: 'COMMISSIONER', slug: 'commissioner', adminLevel: 'CORPORATION', jurisdictionScope: 'CORPORATION', description: 'Corporation Commissioner' },
    { code: 'DEPT_COMMISSIONER', slug: 'dept_commissioner', adminLevel: 'STATE', jurisdictionScope: 'STATE', description: 'Department Commissioner' },
    { code: 'CM', slug: 'cm', adminLevel: 'STATE', jurisdictionScope: 'STATE', description: 'Chief Minister' }
  ]);

  console.log('Seeding zones...');
  await Zone.create([
    { zoneNumber: '4', name: 'Zone 4', region: 'GCC North', wardFrom: 1, wardTo: 15 }
  ]);

  console.log('Seeding pincodes...');
  await PincodeMapping.create([
    { pincode: '600004', place: 'Mylapore', district: 'Chennai' },
    { pincode: '600021', place: 'Royapuram', district: 'Chennai' }
  ]);

  console.log('Seeding lifecycle transitions...');
  await TicketStateTransition.create([
    { fromState: 'SUBMITTED', toState: 'ASSIGNED', performedBy: 'SYSTEM', trigger: 'AUTO_ASSIGN' },
    { fromState: 'ASSIGNED', toState: 'IN_PROGRESS', performedBy: 'OFFICIAL', trigger: 'START_WORK' },
    { fromState: 'IN_PROGRESS', toState: 'ESCALATED', performedBy: 'SYSTEM', trigger: 'SLA_BREACH' },
    { fromState: 'IN_PROGRESS', toState: 'RESOLVED', performedBy: 'OFFICIAL', trigger: 'RESOLVE' }
  ]);

  console.log('Seeding core departments...');
  const deptElec = await Department.create({
    name: 'Electricity & Energy Resources',
    slug: 'electricity',
    primaryDomain: 'tangedco.tn.gov.in',
    isCivicFacing: true
  });

  const deptSan = await Department.create({
    name: 'Health & Sanitation',
    slug: 'sanitation',
    primaryDomain: 'gcc.tn.gov.in',
    isCivicFacing: true
  });

  console.log('Seeding jurisdictions hierarchy...');
  const stateNode = await Jurisdiction.create({
    level: 'STATE',
    name: 'Tamil Nadu'
  });

  const districtNode = await Jurisdiction.create({
    level: 'DISTRICT',
    name: 'Chennai',
    parentId: stateNode._id
  });

  const constituencyNode = await Jurisdiction.create({
    level: 'CONSTITUENCY',
    name: 'Mylapore',
    parentId: districtNode._id
  });

  const mylaporeSectionNode = await Jurisdiction.create({
    level: 'WARD',
    name: 'Mylapore Section',
    parentId: constituencyNode._id
  });

  const talukNode = await Jurisdiction.create({
    level: 'TALUK',
    name: 'Chennai South Area',
    parentId: districtNode._id
  });

  const corporationNode = await Jurisdiction.create({
    level: 'CORPORATION',
    name: 'Greater Chennai Corporation',
    parentId: districtNode._id
  });

  const zoneNode = await Jurisdiction.create({
    level: 'ZONE',
    name: 'Zone 4',
    parentId: corporationNode._id
  });

  const blockNode = await Jurisdiction.create({
    level: 'BLOCK',
    name: 'Division 14',
    parentId: zoneNode._id
  });

  const wardNode = await Jurisdiction.create({
    level: 'WARD',
    name: 'Ward 1',
    parentId: blockNode._id
  });

  console.log('Seeding complaint categories...');
  const catElec = await ComplaintCategory.create({
    code: 'CAT-ELE',
    name: 'Electricity Failure',
    departmentId: deptElec._id,
    defaultAssigneeRole: 'AAE',
    defaultPriority: 'MEDIUM'
  });

  const catSan = await ComplaintCategory.create({
    code: 'CAT-SAN',
    name: 'Sanitation Issue',
    departmentId: deptSan._id,
    defaultAssigneeRole: 'DSI',
    defaultPriority: 'MEDIUM'
  });

  console.log('Seeding category escalations...');
  // 3-step chain for Electricity
  await CategoryEscalation.create([
    { categoryId: catElec._id, level: 'L1', assigneeTitle: 'Assistant Area Engineer', slaDays: 2 },
    { categoryId: catElec._id, level: 'L2', assigneeTitle: 'Area Engineer', slaDays: 4 },
    { categoryId: catElec._id, level: 'L3', assigneeTitle: 'Minister', slaDays: 7 }
  ]);

  // 7-step chain for Sanitation
  await CategoryEscalation.create([
    { categoryId: catSan._id, level: 'L1', assigneeTitle: 'Division Sanitary Inspector', slaDays: 1 },
    { categoryId: catSan._id, level: 'L2', assigneeTitle: 'Sanitary Inspector', slaDays: 2 },
    { categoryId: catSan._id, level: 'L3', assigneeTitle: 'Health Inspector', slaDays: 3 },
    { categoryId: catSan._id, level: 'L4', assigneeTitle: 'City Health Inspector', slaDays: 4 },
    { categoryId: catSan._id, level: 'L5', assigneeTitle: 'Department Commissioner', slaDays: 5 },
    { categoryId: catSan._id, level: 'L6', assigneeTitle: 'Corporation Commissioner', slaDays: 7 },
    { categoryId: catSan._id, level: 'L7', assigneeTitle: 'Minister', slaDays: 10 }
  ]);

  console.log('Seeding exactly 11 officials (password: admin123)...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  // 3 Electricity Officials
  const aaeElec = await Employee.create({
    username: 'aae_electricity',
    name: 'Er. S. Karthikeyan',
    password: passwordHash,
    phone: '+91 94440 10001',
    category: 'Department Official',
    role: 'AAE',
    departmentId: deptElec._id,
    jurisdictionId: mylaporeSectionNode._id
  });

  const aeElec = await Employee.create({
    username: 'ae_chennai',
    name: 'Er. R. Mohanraj',
    password: passwordHash,
    phone: '+91 94440 10002',
    category: 'Department Official',
    role: 'AE',
    departmentId: deptElec._id,
    jurisdictionId: talukNode._id
  });

  const ministerElec = await Employee.create({
    username: 'minister_electricity',
    name: 'C. T. R. Nirmal Kumar',
    password: passwordHash,
    phone: '+91 94440 10003',
    category: 'Elected Representative',
    role: 'Minister',
    departmentId: deptElec._id,
    jurisdictionId: stateNode._id
  });

  // 7 Health/Sanitation Officials
  const dsiSan = await Employee.create({
    username: 'dsi_admin',
    name: 'M. Saravanan',
    password: passwordHash,
    phone: '+91 94440 10004',
    category: 'Department Official',
    role: 'DSI',
    departmentId: deptSan._id,
    jurisdictionId: wardNode._id
  });

  const siSan = await Employee.create({
    username: 'si_admin',
    name: 'K. Priyadharshini',
    password: passwordHash,
    phone: '+91 94440 10005',
    category: 'Department Official',
    role: 'SI',
    departmentId: deptSan._id,
    jurisdictionId: blockNode._id
  });

  const hiSan = await Employee.create({
    username: 'hi_admin',
    name: 'D. Ramesh Babu',
    password: passwordHash,
    phone: '+91 94440 10006',
    category: 'Department Official',
    role: 'HI',
    departmentId: deptSan._id,
    jurisdictionId: zoneNode._id
  });

  const chiSan = await Employee.create({
    username: 'chi_admin',
    name: 'Dr. S. Lakshmi Narayanan',
    password: passwordHash,
    phone: '+91 94440 10007',
    category: 'Department Official',
    role: 'CHI',
    departmentId: deptSan._id,
    jurisdictionId: districtNode._id
  });

  const deptCommSan = await Employee.create({
    username: 'dept_comm_admin',
    name: 'T. Vijayakumar, I.A.S.',
    password: passwordHash,
    phone: '+91 94440 10008',
    category: 'Administrative Officer',
    role: 'Department Commissioner',
    departmentId: deptSan._id,
    jurisdictionId: stateNode._id
  });

  const commSan = await Employee.create({
    username: 'comm_admin',
    name: 'R. Anandhi, I.A.S.',
    password: passwordHash,
    phone: '+91 94440 10009',
    category: 'Administrative Officer',
    role: 'Corporation Commissioner',
    departmentId: deptSan._id,
    jurisdictionId: corporationNode._id
  });

  const ministerHealth = await Employee.create({
    username: 'minister_health',
    name: 'Dr. K.G. Arunraj',
    password: passwordHash,
    phone: '+91 94440 10010',
    category: 'Elected Representative',
    role: 'Minister',
    departmentId: deptSan._id,
    jurisdictionId: stateNode._id
  });

  // 1 Overarching MLA
  const mlaOver = await Employee.create({
    username: 'mla_venkataraman',
    name: 'Thiru P. Venkataramanan',
    password: passwordHash,
    phone: '+91 94440 10011',
    category: 'Elected Representative',
    role: 'MLA',
    departmentId: null,
    jurisdictionId: constituencyNode._id
  });

  const mlaMylapore = await Employee.create({
    username: 'mla_mylapore',
    name: 'Thiru. Dha. Velu',
    password: passwordHash,
    phone: '+91 94440 10012',
    category: 'Elected Representative',
    role: 'MLA',
    departmentId: null,
    jurisdictionId: constituencyNode._id
  });

  const cmAdmin = await Employee.create({
    username: 'cm_admin',
    name: 'Thiru. M.K. Stalin',
    password: passwordHash,
    phone: '+91 94440 10013',
    category: 'Elected Representative',
    role: 'CM',
    departmentId: null,
    jurisdictionId: stateNode._id
  });

  console.log('Database seeding completed successfully.');
  console.log(`Seeded departments: 2`);
  console.log(`Seeded officials: 13`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  });
