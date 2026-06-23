import mongoose, { Schema } from 'mongoose';

const complaintCategorySchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  defaultAssigneeRole: { type: String, required: true },
  defaultPriority: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      if (ret.departmentId) ret.departmentId = ret.departmentId.toString();
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
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

complaintCategorySchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

complaintCategorySchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'categoryId'
});

complaintCategorySchema.virtual('escalations', {
  ref: 'CategoryEscalation',
  localField: '_id',
  foreignField: 'categoryId'
});

const ComplaintCategory = mongoose.models.ComplaintCategory || mongoose.model('ComplaintCategory', complaintCategorySchema);
export default ComplaintCategory;
