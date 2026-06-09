const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      jurisdiction: true,
      assignedTo: true
    }
  });

  console.log("LAST 5 TICKETS:");
  tickets.forEach(t => {
    console.log(`- ${t.ticketNumber} | Status: ${t.status} | Juris: ${t.jurisdiction?.name} | AssignedTo: ${t.assignedTo?.username || 'NONE'}`);
  });
  
  const ward1 = await prisma.jurisdiction.findMany({
    where: { name: { contains: 'Ward 1' } },
    take: 5
  });
  console.log("\nWARDS CONTAINING 'Ward 1':");
  ward1.forEach(w => console.log(`- ${w.name} (ID: ${w.id})`));

  const lineMan = await prisma.employee.findUnique({
    where: { username: 'line_man' }
  });
  console.log("\nLINE_MAN JURISDICTION ID:", lineMan?.jurisdictionId);

  await prisma.$disconnect();
}

check().catch(console.error);
