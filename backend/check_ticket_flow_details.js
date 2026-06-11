const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHistory() {
  const tickets = await prisma.ticket.findMany({
    include: {
      history: {
        include: {
          employee: true
        },
        orderBy: { createdAt: 'asc' }
      },
      assignedTo: true,
      citizen: true,
      category: true,
      department: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log("--- TICKET FLOW VERIFICATION (DB) ---\n");

  tickets.forEach(t => {
    console.log(`Ticket: ${t.ticketNumber}`);
    console.log(`  ID: ${t.id}`);
    console.log(`  Status: ${t.status}`);
    console.log(`  Category: ${t.category?.name || 'N/A'}`);
    console.log(`  Dept: ${t.department?.name || 'N/A'}`);
    console.log(`  Citizen: ${t.citizen?.name || 'N/A'}`);
    console.log(`  Assigned To: ${t.assignedTo?.name || 'NONE'} (${t.assignedTo?.role || 'N/A'})`);
    console.log(`  History:`);
    t.history.forEach(h => {
      const actor = h.employee ? `Employee: ${h.employee.name} (${h.employee.role})` : 'Citizen/System';
      console.log(`    - [${h.createdAt.toISOString()}] ${h.action}: ${h.notes} (By: ${actor})`);
    });
    console.log("");
  });

  await prisma.$disconnect();
}

checkHistory().catch(console.error);
