import mongoose, { Schema } from 'mongoose';

const ticketHistorySchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  action: { type: String, required: true }, // e.g. 'created', 'status_changed', 'assigned', 'commented'
  notes: { type: String, default: null },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.ticketId) ret.ticketId = ret.ticketId.toString();
      if (ret.employeeId) ret.employeeId = ret.employeeId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.ticketId) ret.ticketId = ret.ticketId.toString();
      if (ret.employeeId) ret.employeeId = ret.employeeId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

ticketHistorySchema.virtual('ticket', {
  ref: 'Ticket',
  localField: 'ticketId',
  foreignField: '_id',
  justOne: true
});

ticketHistorySchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true
});

const TicketHistory = mongoose.models.TicketHistory || mongoose.model('TicketHistory', ticketHistorySchema);
export default TicketHistory;
