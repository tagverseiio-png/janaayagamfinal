import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  console.log('--- TESTING NEW BACKEND FEATURES ---');

  try {
    // 1. Create a CM employee if not exists
    let cm = await prisma.employee.findFirst({ where: { role: 'CM' } });
    if (!cm) {
      cm = await prisma.employee.create({
        data: {
          username: 'cm_test',
          password: 'password',
          name: 'CM Test',
          category: 'Elected Representative',
          role: 'CM'
        }
      });
      console.log('Created CM test user');
    }

    // 2. Test Announcements
    const announcement = await prisma.announcement.create({
      data: {
        title: 'State Emergency Alert',
        text: 'Heavy rainfall expected in Chennai. Please stay indoors.',
        district: 'Chennai',
        authorId: cm.id
      }
    });
    console.log('Announcement created:', announcement.title);

    const announcements = await prisma.announcement.findMany({ where: { district: 'Chennai' } });
    console.log('Announcements for Chennai:', announcements.length);

    // 3. Test Cabinet Reports
    const rankings = [
      { dept: 'Electricity', minister: 'C. T. R. Nirmal Kumar', rate: 95, pending: 10 },
      { dept: 'Health', minister: 'Dr. K.G. Arunraj', rate: 88, pending: 25 }
    ];

    const report = await prisma.cabinetReport.create({
      data: {
        title: 'Monthly Performance Audit',
        summaryText: 'Overall performance is satisfactory.',
        rankings: JSON.stringify(rankings)
      }
    });
    console.log('Cabinet Report created:', report.title);

    const latestReport = await prisma.cabinetReport.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log('Latest Report rankings:', JSON.parse(latestReport?.rankings || '[]').length, 'departments');

    console.log('--- ALL TESTS PASSED ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
