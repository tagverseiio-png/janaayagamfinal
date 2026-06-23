import mongoose, { Schema } from 'mongoose';

const ticketSchema = new Schema({
  ticketNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "SUBMITTED" }, // SUBMITTED, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, REOPENED, CLOSED
  priority: { type: String, default: "MEDIUM" }, // LOW, MEDIUM, HIGH, CRITICAL
  channel: { type: String, default: "WEB" }, // APP, WEB, HELPLINE, EMAIL, WALK_IN
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  citizenId: { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ComplaintCategory', default: null },
  jurisdictionId: { type: Schema.Types.ObjectId, ref: 'Jurisdiction', default: null },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  deadline: { type: Date, default: null },
  photo: { type: String, default: null },
  proofPhoto: { type: String, default: null },
  rating: { type: Number, default: null },
  reopenReason: { type: String, default: null },
  claimCount: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      if (ret.citizenId) ret.citizenId = ret.citizenId.toString();
      if (ret.departmentId) ret.departmentId = ret.departmentId.toString();
      if (ret.categoryId) ret.categoryId = ret.categoryId.toString();
      if (ret.jurisdictionId) ret.jurisdictionId = ret.jurisdictionId.toString();
      if (ret.assignedToId) ret.assignedToId = ret.assignedToId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      if (ret.citizenId) ret.citizenId = ret.citizenId.toString();
      if (ret.departmentId) ret.departmentId = ret.departmentId.toString();
      if (ret.categoryId) ret.categoryId = ret.categoryId.toString();
      if (ret.jurisdictionId) ret.jurisdictionId = ret.jurisdictionId.toString();
      if (ret.assignedToId) ret.assignedToId = ret.assignedToId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Relationships
ticketSchema.virtual('citizen', {
  ref: 'Citizen',
  localField: 'citizenId',
  foreignField: '_id',
  justOne: true
});

ticketSchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

ticketSchema.virtual('category', {
  ref: 'ComplaintCategory',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

ticketSchema.virtual('jurisdiction', {
  ref: 'Jurisdiction',
  localField: 'jurisdictionId',
  foreignField: '_id',
  justOne: true
});

ticketSchema.virtual('assignedTo', {
  ref: 'Employee',
  localField: 'assignedToId',
  foreignField: '_id',
  justOne: true
});

ticketSchema.virtual('history', {
  ref: 'TicketHistory',
  localField: '_id',
  foreignField: 'ticketId'
});

ticketSchema.virtual('claims', {
  ref: 'TicketClaim',
  localField: '_id',
  foreignField: 'ticketId'
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export default Ticket;
