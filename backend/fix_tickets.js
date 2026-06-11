const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTickets() {
  const tickets = await prisma.ticket.findMany({
    where: { categoryId: null },
    include: { category: true }
  });

  console.log(`Found ${tickets.length} tickets without category. Fixing...`);

  for (const t of tickets) {
    let categoryCode = '';
    if (t.title.includes('Water')) categoryCode = 'CAT-WTR';
    else if (t.title.includes('Road') || t.title.includes('Pot Holes')) categoryCode = 'CAT-RDC';
    else if (t.title.includes('Electricity') || t.title.includes('Light')) categoryCode = 'CAT-ELE';
    else if (t.title.includes('Sanitation')) categoryCode = 'CAT-SAN';

    if (categoryCode) {
      const category = await prisma.complaintCategory.findUnique({ where: { code: categoryCode } });
      if (category) {
        await prisma.ticket.update({
          where: { id: t.id },
          data: {
            categoryId: category.id,
            departmentId: category.departmentId,
            status: t.status.toUpperCase() // Also normalize status
          }
        });
        console.log(`Fixed ticket ${t.ticketNumber}: Assigned to ${category.name}`);
      }
    } else {
        // Just normalize status if category not found
        await prisma.ticket.update({
          where: { id: t.id },
          data: {
            status: t.status.toUpperCase()
          }
        });
        console.log(`Normalized status for ticket ${t.ticketNumber}`);
    }
  }

  await prisma.$disconnect();
}

fixTickets().catch(console.error);
