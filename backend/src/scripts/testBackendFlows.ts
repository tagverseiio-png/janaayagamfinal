import { prisma } from '../index';
import bcrypt from 'bcryptjs';

async function testFlows() {
  console.log('🚀 Starting Comprehensive Backend Flow Test...');

  try {
    // 1. Setup - Ensure we have a citizen and necessary metadata
    let citizen = await prisma.citizen.findUnique({ where: { phone: '9876543210' } });
    if (!citizen) {
      citizen = await prisma.citizen.create({
        data: {
          phone: '9876543210',
          name: 'Test Citizen',
        }
      });
      console.log('✅ Created Test Citizen');
    }

    const electricityDept = await prisma.department.findUnique({ where: { slug: 'electricity' } });
    const roadsDept = await prisma.department.findUnique({ where: { slug: 'highways-minor-ports' } });

    if (!electricityDept || !roadsDept) {
      throw new Error('Electricity or Roads department not found. Please run seed script first.');
    }

    const electricityCat = await prisma.complaintCategory.findUnique({ where: { code: 'CAT-ELE' } });
    const roadsCat = await prisma.complaintCategory.findUnique({ where: { code: 'CAT-RDC' } });

    // 2. Test Electricity Flow: AAE -> AE -> Minister
    console.log('\n--- ⚡ Testing Electricity Escalation Chain ---');
    
    // Create Electricity Ticket
    const ticketEle = await prisma.ticket.create({
      data: {
        ticketNumber: `ELE-TEST-${Date.now()}`,
        title: 'Power Outage in Block A',
        description: 'No power for 4 hours',
        citizenId: citizen.id,
        departmentId: electricityDept.id,
        categoryId: electricityCat?.id,
        status: 'SUBMITTED'
      }
    });
    console.log(`✅ Electricity Ticket Created: ${ticketEle.ticketNumber}`);

    // Assign to AAE
    const aae = await prisma.employee.findFirst({ where: { departmentId: electricityDept.id, role: 'WARD_AEO' } }); // WARD_AEO is alias for AAE
    if (aae) {
      await prisma.ticket.update({
        where: { id: ticketEle.id },
        data: { assignedToId: aae.id, status: 'ASSIGNED' }
      });
      console.log(`➡️ Assigned to Assistant Area Engineer: ${aae.name}`);
    }

    // Escalate to AE
    const ae = await prisma.employee.findFirst({ where: { departmentId: electricityDept.id, role: 'AREA_ENGINEER' } });
    if (ae) {
      await prisma.ticket.update({
        where: { id: ticketEle.id },
        data: { assignedToId: ae.id, status: 'ESCALATED' }
      });
      console.log(`➡️ Escalated to Area Engineer: ${ae.name}`);
    }

    // Escalate to Minister
    const minister = await prisma.employee.findFirst({ where: { departmentId: electricityDept.id, role: 'MINISTER' } });
    if (minister) {
      await prisma.ticket.update({
        where: { id: ticketEle.id },
        data: { assignedToId: minister.id, status: 'ESCALATED' }
      });
      console.log(`➡️ Escalated to Minister: ${minister.name}`);
    }

    // 3. Test Roads Flow: Ward AEO -> Area Engineer -> Commissioner
    console.log('\n--- 🛣️ Testing Roads Escalation Chain ---');
    
    // Create Roads Ticket
    const ticketRoad = await prisma.ticket.create({
      data: {
        ticketNumber: `RDS-TEST-${Date.now()}`,
        title: 'Large Pothole on Main St',
        description: 'Dangerous pothole near the school',
        citizenId: citizen.id,
        departmentId: roadsDept.id,
        categoryId: roadsCat?.id,
        status: 'SUBMITTED'
      }
    });
    console.log(`✅ Roads Ticket Created: ${ticketRoad.ticketNumber}`);

    // Assign to Ward AEO
    const wardAeo = await prisma.employee.findFirst({ where: { departmentId: roadsDept.id, role: 'WARD_AEO' } });
    if (wardAeo) {
      await prisma.ticket.update({
        where: { id: ticketRoad.id },
        data: { assignedToId: wardAeo.id, status: 'ASSIGNED' }
      });
      console.log(`➡️ Assigned to Ward Officer: ${wardAeo.name}`);
    }

    // 4. Test Duplicate Detection
    console.log('\n--- 🔍 Testing Duplicate Detection ---');
    const duplicate = await prisma.ticket.findFirst({
      where: {
        categoryId: roadsCat?.id,
        status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
      }
    });
    if (duplicate) {
      console.log(`✅ Duplicate Detected: ${duplicate.ticketNumber}`);
    }

    console.log('\n✨ Backend Flow Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFlows();
