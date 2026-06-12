const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const t = await prisma.ticket.findFirst({ where: { ticketNumber: 'TN-2026-000003' } });
  const e = await prisma.employee.findUnique({ where: { username: 'area_engineer' } });
  if (t && e) {
    await prisma.ticket.update({
      where: { id: t.id },
      data: { assignedToId: e.id }
    });
    console.log(`Ticket TN-2026-000003 reassigned to ${e.username}`);
  } else {
    console.log("Ticket or Employee not found");
  }
  await prisma.$disconnect();
}

fix().catch(console.error);
