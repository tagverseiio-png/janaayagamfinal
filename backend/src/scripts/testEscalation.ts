import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from '../models/Ticket';
import Employee from '../models/Employee';
import ComplaintCategory from '../models/ComplaintCategory';
import Citizen from '../models/Citizen';
import Jurisdiction from '../models/Jurisdiction';
import TicketHistory from '../models/TicketHistory';
import { updateTicket } from '../controllers/ticketController';
import { Request, Response } from 'express';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jananayagam';

// Helper to mock express response
const mockResponse = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function test() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    // Find Citizen
    const citizen = await Citizen.findOne({ phone: '9876543210' });
    if (!citizen) throw new Error('Citizen not found. Run seed script first.');

    // Find Electricity Category
    const category = await ComplaintCategory.findOne({ code: 'CAT-ELE' });
    if (!category) throw new Error('CAT-ELE category not found. Run seed script first.');

    // Find Assistant Area Engineer (AAE)
    const aae = await Employee.findOne({ username: 'aae_electricity' });
    if (!aae) throw new Error('aae_electricity not found.');

    // Find Area Engineer (AE)
    const ae = await Employee.findOne({ username: 'ae_chennai' });
    if (!ae) throw new Error('ae_chennai not found.');

    // Find Minister
    const minister = await Employee.findOne({ username: 'minister_electricity' });
    if (!minister) throw new Error('minister_electricity not found.');

    // Create a new test ticket
    console.log('\n--- Creating Electricity Ticket ---');
    const ticketNumber = `TEST-${Date.now()}`;
    const ticket = await Ticket.create({
      ticketNumber,
      title: 'Power Line Sparking',
      description: 'Main road line is sparking',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      citizenId: citizen._id,
      departmentId: category.departmentId,
      categoryId: category._id,
      assignedToId: aae._id
    });
    console.log(`Ticket created: ID=${ticket._id}, Assignee=${aae.name} (${aae.role})`);

    // 1. Escalate L1 -> L2
    console.log('\n--- Test Escalating AAE (L1) -> AE (L2) ---');
    const reqEscalate1 = {
      params: { id: ticket._id.toString() },
      body: { status: 'ESCALATED', notes: 'Escalating to Area Engineer Mohanraj' },
      user: { id: aae._id.toString(), type: 'employee', role: 'AAE' }
    } as unknown as Request;

    const resEscalate1 = mockResponse();
    await updateTicket(reqEscalate1, resEscalate1);

    if (resEscalate1.statusCode === 400 || resEscalate1.jsonData?.error) {
      throw new Error(`Escalation 1 failed: ${resEscalate1.jsonData.error}`);
    }

    let updatedTicket = await Ticket.findById(ticket._id).populate('assignedTo');
    console.log(`Status: ${updatedTicket?.status}`);
    console.log(`New Assignee: ${updatedTicket?.assignedTo?.name} (${updatedTicket?.assignedTo?.role})`);
    
    if (updatedTicket?.assignedToId?.toString() !== ae._id.toString()) {
      throw new Error('Ticket was not correctly escalated to ae_chennai');
    }
    console.log('✅ Escalated successfully to Area Engineer Mohanraj!');

    // 2. Test status decrease (ESCALATED -> ASSIGNED) - Should fail!
    console.log('\n--- Test Status Decrease Attempt (ESCALATED -> ASSIGNED) ---');
    const reqDecrease = {
      params: { id: ticket._id.toString() },
      body: { status: 'ASSIGNED', notes: 'Trying to push back status to ASSIGNED' },
      user: { id: ae._id.toString(), type: 'employee', role: 'AE' }
    } as unknown as Request;

    const resDecrease = mockResponse();
    await updateTicket(reqDecrease, resDecrease);

    console.log(`Response Code: ${resDecrease.statusCode}`);
    console.log(`Response JSON:`, resDecrease.jsonData);

    if (resDecrease.statusCode === 400 && resDecrease.jsonData?.error?.includes('Status decrease is not allowed')) {
      console.log('✅ Status decrease blocked successfully with expected error message!');
    } else {
      throw new Error('Status decrease was not rejected correctly!');
    }

    // 3. Escalate L2 -> L3 (AE -> Minister)
    console.log('\n--- Test Escalating AE (L2) -> Minister (L3) ---');
    const reqEscalate2 = {
      params: { id: ticket._id.toString() },
      body: { status: 'ESCALATED', notes: 'Escalating to Minister CTR Nirmal Kumar' },
      user: { id: ae._id.toString(), type: 'employee', role: 'AE' }
    } as unknown as Request;

    const resEscalate2 = mockResponse();
    await updateTicket(reqEscalate2, resEscalate2);

    updatedTicket = await Ticket.findById(ticket._id).populate('assignedTo');
    console.log(`Status: ${updatedTicket?.status}`);
    console.log(`New Assignee: ${updatedTicket?.assignedTo?.name} (${updatedTicket?.assignedTo?.role})`);

    if (updatedTicket?.assignedToId?.toString() !== minister._id.toString()) {
      throw new Error('Ticket was not correctly escalated to minister_electricity');
    }
    console.log('✅ Escalated successfully to Minister CTR Nirmal Kumar!');

    // Cleanup
    await TicketHistory.deleteMany({ ticketId: ticket._id });
    await Ticket.findByIdAndDelete(ticket._id);
    console.log('\nCleanup successful.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

test();
