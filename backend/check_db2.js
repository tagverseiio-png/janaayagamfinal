const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const t = await prisma.ticket.findUnique({
    where: { ticketNumber: 'TN-2026-000002' },
    include: { jurisdiction: true }
  });
  console.log("Ticket 2 Juris:", t.jurisdiction);

  const w1 = await prisma.jurisdiction.findUnique({
    where: { id: '20b44c2a-6444-4eb9-9d1c-a7702bf0fc10' }
  });
  console.log("LINE_MAN Juris:", w1);

  await prisma.$disconnect();
}

check().catch(console.error);
