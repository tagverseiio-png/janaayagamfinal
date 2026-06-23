import mongoose, { Schema } from 'mongoose';

const departmentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true },
  primaryDomain: { type: String },
  isCivicFacing: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'departmentId'
});

departmentSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'departmentId'
});

departmentSchema.virtual('categories', {
  ref: 'ComplaintCategory',
  localField: '_id',
  foreignField: 'departmentId'
});

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
export default Department;
