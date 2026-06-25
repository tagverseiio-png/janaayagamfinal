import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Ticket from '../models/Ticket';
import Department from '../models/Department';
import ComplaintCategory from '../models/ComplaintCategory';
import Employee from '../models/Employee';
import CategoryEscalation from '../models/CategoryEscalation';
import TicketHistory from '../models/TicketHistory';
import { connectDB } from '../db';

async function main() {
  await connectDB();
  try {
    const ticket = await Ticket.findOne({ ticketNumber: 'TN-2026-000002' });
    if (!ticket) {
      console.error('Ticket TN-2026-000002 not found!');
      return;
    }
    console.log('Current Ticket state in DB:', {
      ticketNumber: ticket.ticketNumber,
      departmentId: ticket.departmentId,
      categoryId: ticket.categoryId,
      assignedToId: ticket.assignedToId,
      status: ticket.status
    });

    const newDeptId = '6a3c701dfe9896c1664ecd17'; // Health & Sanitation
    const newCatId = '6a3c701efe9896c1664ecd2d';  // Sanitation Issue

    const data: any = {
      departmentId: newDeptId,
      categoryId: newCatId,
      status: 'ASSIGNED'
    };

    // Auto-assign logic
    const category = await ComplaintCategory.findById(newCatId).populate({
      path: 'escalations',
      options: { sort: { level: 1 } }
    });
    const escalations = category?.escalations as any[] | undefined;
    if (category && escalations && escalations.length > 0) {
      const firstRole = escalations[0].assigneeTitle;
      const officer = await Employee.findOne({
        departmentId: newDeptId,
        role: 'DSI'
      });
      if (officer) {
        data.assignedToId = officer._id;
        console.log(`Auto-assigning to officer: ${officer.name} (${officer.role})`);
      }
    }

    const updated = await Ticket.findByIdAndUpdate(ticket._id, { $set: data }, { new: true })
      .populate('department')
      .populate({
        path: 'category',
        populate: {
          path: 'escalations',
          options: { sort: { level: 1 } }
        }
      })
      .populate('assignedTo');

    console.log('Updated Ticket state in DB:', {
      ticketNumber: updated.ticketNumber,
      department: updated.department?.name,
      departmentId: updated.departmentId,
      category: updated.category?.name,
      categoryId: updated.categoryId,
      assignedTo: updated.assignedTo?.name,
      assignedToId: updated.assignedToId,
      status: updated.status,
      hierarchySteps: updated.category?.escalations?.map(e => e.assigneeTitle)
    });

    // Create a history record to match
    await TicketHistory.create({
      ticketId: ticket._id,
      action: 'status_changed_to_ASSIGNED',
      notes: `Reassigned: Moved to Health & Sanitation (Sanitation Issue). Reason: Transferring to Sanitation`,
      employeeId: new mongoose.Types.ObjectId('6a3c701efe9896c1664ecd43') // Er. S. Karthikeyan
    });
    console.log('History record created.');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
