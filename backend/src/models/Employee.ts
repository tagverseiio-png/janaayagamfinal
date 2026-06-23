import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  name: { type: String, required: true },
  category: { type: String, required: true }, // 'Elected Representative', 'Administrative Officer', 'Department Official', 'Field Worker'
  role: { type: String, required: true }, // e.g. 'District Collector', 'MLA', 'AE'
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  jurisdictionId: { type: Schema.Types.ObjectId, ref: 'Jurisdiction', default: null }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      if (ret.departmentId) ret.departmentId = ret.departmentId.toString();
      if (ret.jurisdictionId) ret.jurisdictionId = ret.jurisdictionId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      if (ret.departmentId) ret.departmentId = ret.departmentId.toString();
      if (ret.jurisdictionId) ret.jurisdictionId = ret.jurisdictionId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

employeeSchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

employeeSchema.virtual('jurisdiction', {
  ref: 'Jurisdiction',
  localField: 'jurisdictionId',
  foreignField: '_id',
  justOne: true
});

employeeSchema.virtual('assignedTickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'assignedToId'
});

employeeSchema.virtual('ticketHistory', {
  ref: 'TicketHistory',
  localField: '_id',
  foreignField: 'employeeId'
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
