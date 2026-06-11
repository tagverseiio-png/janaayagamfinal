const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateLogic() {
  const categoryCode = 'CAT-RDC';
  console.log(`Searching for category: ${categoryCode}`);
  
  const category = await prisma.complaintCategory.findUnique({
    where: { code: categoryCode }
  });
  
  if (category) {
    console.log("Found category:", category);
  } else {
    console.log("Category NOT found!");
  }
  
  const jurisdictionName = 'Ward 1: Kodungaiyur (West)';
  console.log(`Searching for jurisdiction: ${jurisdictionName}`);
  const juris = await prisma.jurisdiction.findFirst({ where: { name: { contains: jurisdictionName } } });
  if (juris) {
    console.log("Found jurisdiction:", juris.id, juris.name);
  } else {
    console.log("Jurisdiction NOT found!");
  }

  await prisma.$disconnect();
}

testCreateLogic().catch(console.error);
