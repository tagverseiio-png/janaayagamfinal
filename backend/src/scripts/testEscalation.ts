import { prisma } from '../index';

(async () => {
  try {
    console.log('Starting escalation test...');

    const dept = await prisma.department.findFirst({ where: { name: { contains: 'Water' } } });
    if (!dept) throw new Error('Water department not found');

    const category = await prisma.complaintCategory.findFirst({ where: { code: 'CAT-WTR' } });
    if (!category) throw new Error('CAT-WTR not found');

    const ward = await prisma.jurisdiction.findFirst({ where: { level: 'WARD' } });
    if (!ward) throw new Error('No ward jurisdiction found');

    const citizen = await prisma.citizen.create({ data: { phone: '9990001234', name: 'Test Citizen' } });
    console.log('Created citizen:', citizen.id);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TEST-${Date.now()}`,
        title: 'Test Water Issue',
        description: 'Testing escalation flow',
        citizenId: citizen.id,
        departmentId: dept.id,
        categoryId: category.id,
        jurisdictionId: ward.id
      }
    });

    console.log('Created ticket:', ticket.id);

    // Find first responder (WARD_AEO)
    const firstResponder = await prisma.employee.findFirst({ where: { departmentId: dept.id, role: { contains: category.defaultAssigneeRole } } });
    if (firstResponder) {
      await prisma.ticket.update({ where: { id: ticket.id }, data: { assignedToId: firstResponder.id } });
      await prisma.ticketHistory.create({ data: { ticketId: ticket.id, action: 'assigned', notes: 'Auto-assigned to first responder', employeeId: firstResponder.id } });
      console.log('Assigned to first responder:', firstResponder.name, firstResponder.role);
    } else {
      console.warn('No first responder found for role:', category.defaultAssigneeRole);
    }

    // Escalate to Deputy Area Engineer
    const deputy = await prisma.employee.findFirst({ where: { departmentId: dept.id, role: { contains: 'Deputy Area Engineer' } } });
    if (deputy) {
      await prisma.ticket.update({ where: { id: ticket.id }, data: { assignedToId: deputy.id, status: 'Escalated' } });
      await prisma.ticketHistory.create({ data: { ticketId: ticket.id, action: 'escalated', notes: 'Escalated to Deputy AE', employeeId: deputy.id } });
      console.log('Escalated to deputy:', deputy.name, deputy.role);
    } else {
      console.warn('No deputy found to escalate to');
    }

    const final = await prisma.ticket.findUnique({ where: { id: ticket.id }, include: { assignedTo: true } });
    console.log('Final ticket assignment:', final?.assignedTo?.name, final?.assignedTo?.role);

  } catch (err) {
    console.error('Escalation test error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
