import { prisma } from '../index';

(async () => {
  const patterns = [
    'WARD_AEO',
    'Ward',
    'LINE_MAN',
    'Line Man',
    'DSI',
    'Sanitary Inspector',
    'Deputy Area Engineer',
    'Area Engineer',
    'Super Agent',
    'Department Director',
    'Commissioner',
  ];

  for (const p of patterns) {
    const users = await prisma.employee.findMany({
      where: { role: { contains: p } },
      select: { id: true, name: true, role: true, departmentId: true, jurisdictionId: true }
    });
    console.log(`Pattern: "${p}" -> ${users.length}`);
    users.forEach(u => console.log(' -', u.name, '|', u.role, '| id:', u.id));
  }

  await prisma.$disconnect();
})();

