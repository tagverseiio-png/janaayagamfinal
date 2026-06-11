const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reproduceCreate() {
  const citizenId = 'c2c5ef7c-b3e6-4a35-9226-0ddc6124c435'; // kk
  const categoryCode = 'CAT-RDC';
  const jurisdictionName = 'Ward 1: Kodungaiyur (West)';
  
  console.log("Starting reproduction...");
  
  let finalDeptId = undefined;
  let finalCategoryId = undefined;

  if (categoryCode) {
    const category = await prisma.complaintCategory.findUnique({
      where: { code: categoryCode }
    });
    if (category) {
      finalCategoryId = category.id;
      finalDeptId = category.departmentId;
      console.log("Found category in logic:", category.name, "ID:", category.id);
    } else {
      console.log("Category NOT found in logic!");
    }
  }

  let finalJurisId = undefined;
  if (jurisdictionName) {
    const juris = await prisma.jurisdiction.findFirst({ where: { name: { contains: jurisdictionName } } });
    if (juris) {
      finalJurisId = juris.id;
      console.log("Found jurisdiction in logic:", juris.name, "ID:", juris.id);
    }
  }

  const count = await prisma.ticket.count();
  const ticketNumber = `REPRO-${(count + 1).toString().padStart(6, '0')}`;

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      title: 'Reproduction Test',
      description: 'Test description',
      citizenId,
      departmentId: finalDeptId,
      categoryId: finalCategoryId,
      jurisdictionId: finalJurisId,
    }
  });

  console.log("Created ticket:", ticket);

  await prisma.$disconnect();
}

reproduceCreate().catch(console.error);
