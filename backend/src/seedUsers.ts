import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding administrative and employee accounts...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // Helper to fetch random jurisdictions
  const getState = async () => prisma.jurisdiction.findFirst({ where: { level: 'STATE' } });
  const getDistrict = async () => prisma.jurisdiction.findFirst({ where: { level: 'DISTRICT' } });
  const getConstituency = async () => prisma.jurisdiction.findFirst({ where: { level: 'CONSTITUENCY' } });
  const getWard = async () => prisma.jurisdiction.findFirst({ where: { level: 'WARD' } });

  const state = await getState();
  const district = await getDistrict();
  const constituency = await getConstituency();
  const ward = await getWard();

  const accounts = [
    {
      username: 'cm_admin',
      name: 'Chief Minister',
      category: 'Elected Representative',
      role: 'CM',
      jurisdictionId: state?.id,
    },
    {
      username: 'minister_admin',
      name: 'State Minister',
      category: 'Elected Representative',
      role: 'Minister',
      jurisdictionId: state?.id,
    },
    {
      username: 'sec_admin',
      name: 'Department Secretary',
      category: 'Department Official',
      role: 'Department Secretary',
      jurisdictionId: state?.id,
    },
    {
      username: 'collector_admin',
      name: 'District Collector',
      category: 'Administrative Officer',
      role: 'District Collector',
      jurisdictionId: district?.id,
    },
    {
      username: 'mla_admin',
      name: 'Member of Legislative Assembly',
      category: 'Elected Representative',
      role: 'MLA',
      jurisdictionId: constituency?.id,
    },
    {
      username: 'dro_admin',
      name: 'District Revenue Officer',
      category: 'Administrative Officer',
      role: 'DRO',
      jurisdictionId: district?.id,
    },
    {
      username: 'ward_admin',
      name: 'Ward Officer',
      category: 'Administrative Officer',
      role: 'Ward Officer',
      jurisdictionId: ward?.id,
    }
  ];

  for (const acc of accounts) {
    const exists = await prisma.employee.findUnique({ where: { username: acc.username } });
    if (!exists) {
      await prisma.employee.create({
        data: {
          username: acc.username,
          password: passwordHash,
          name: acc.name,
          category: acc.category,
          role: acc.role,
          jurisdictionId: acc.jurisdictionId,
        }
      });
      console.log(`Created: ${acc.username} / admin123 (${acc.role})`);
    } else {
      console.log(`Exists: ${acc.username}`);
    }
  }

  console.log('User seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
