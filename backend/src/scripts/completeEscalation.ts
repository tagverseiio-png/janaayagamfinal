import { prisma } from '../index';

(async () => {
  try {
    const ticketId = 'f29199f7-1892-440d-92cd-c817a2397bcb';
    const deputyId = '4056bd36-c786-458a-b58e-795948c0c038';

    const t = await prisma.ticket.update({ where: { id: ticketId }, data: { assignedToId: deputyId, status: 'Escalated' } });
    await prisma.ticketHistory.create({ data: { ticketId: ticketId, action: 'escalated', notes: 'Programmatic escalation to Deputy AE', employeeId: deputyId } });
    console.log('Updated ticket:', t.id, 'assignedToId:', deputyId);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
