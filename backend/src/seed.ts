import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.employee.findUnique({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.employee.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Super Admin',
        category: 'Administrative Officer',
        role: 'Superadmin',
        phone: '0000000000'
      },
    });
    console.log('Superadmin user created: admin / admin123');
  } else {
    console.log('Superadmin user already exists.');
  }

  console.log('Seeding 43 departments...');
  const departments = [
    'Water (TWAD/Metro Water)',
    'Electricity (TANGEDCO/EB)',
    'Sanitation',
    'PWD / Roads',
    'Health (Govt Hospitals)',
    'School Education',
    'Higher Education',
    'Revenue',
    'Police',
    'Agriculture',
    'Animal Husbandry',
    'Transport (RTO)',
    'Housing (TNHB)',
    'Highways',
    'Forest',
    'Fisheries',
    'Social Welfare',
    'Adi Dravidar Welfare',
    'BC/MBC Welfare',
    'Differently Abled Welfare',
    'Women & Child Development',
    'Rural Development (TNRD)',
    'Panchayat',
    'Municipality',
    'Corporation (GCC/City)',
    'Fire & Rescue',
    'Registrar (Land/Marriage)',
    'Labour',
    'Legal Metrology',
    'Food Safety (FSSAI/TN)',
    'Cooperative',
    'Handlooms & Textiles',
    'Tourism',
    'Industries (SIDCO/SIPCOT)',
    'Environment',
    'Information (DI&PR)',
    'Archaeology',
    'Tamil Development',
    'Sports & Youth Affairs',
    'Adi Dravidar Housing (TAHDCO)',
    'Slum Clearance (TNSCB)',
    'Postal Services (TN Circle)',
    'Civil Supplies (TNCSC)'
  ];

  for (const deptName of departments) {
    const exists = await prisma.department.findUnique({
      where: { name: deptName }
    });
    if (!exists) {
      await prisma.department.create({
        data: { name: deptName }
      });
      console.log(`Created department: ${deptName}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
