const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function getEmpToken() {
  const prisma = new PrismaClient();
  const emp = await prisma.employee.findUnique({ where: { username: 'ward_aeo' } });
  if (!emp) {
    console.error("Employee not found");
    process.exit(1);
  }
  
  const token = jwt.sign(
    { id: emp.id, type: 'employee', username: emp.username, role: emp.role, departmentId: emp.departmentId, jurisdictionId: emp.jurisdictionId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log(token);
  await prisma.$disconnect();
}

getEmpToken();
