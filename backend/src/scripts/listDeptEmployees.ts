import { prisma } from '../index';

(async () => {
  try {
    const dept = await prisma.department.findFirst({ where: { name: { contains: 'Water' } } });
    if (!dept) return console.error('Water dept not found');
    console.log('Water department id:', dept.id);

    const employees = await prisma.employee.findMany({ where: { departmentId: dept.id } });
    console.log('Employees in Water department:', employees.length);
    employees.forEach(e => console.log('-', e.name, '|', e.role, '|', e.id));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
