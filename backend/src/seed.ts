import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.employee.findUnique({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.employee.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Super Admin',
        category: 'Administrative Officer',
        role: 'Superadmin',
        phone: '0000000000'
      },
    });
    console.log('Superadmin user created: admin / admin123');
  } else {
    console.log('Superadmin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
