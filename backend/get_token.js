const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function getToken() {
  const prisma = new PrismaClient();
  const citizen = await prisma.citizen.findFirst({ where: { phone: '9999999999' } });
  if (!citizen) {
    console.error("Citizen not found");
    process.exit(1);
  }
  
  const token = jwt.sign(
    { id: citizen.id, type: 'citizen', phone: citizen.phone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log(token);
  await prisma.$disconnect();
}

getToken();
