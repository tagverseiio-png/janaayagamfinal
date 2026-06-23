import mongoose, { Schema } from 'mongoose';

const categoryEscalationSchema = new Schema({
  categoryId: { type: Schema.Types.ObjectId, ref: 'ComplaintCategory', required: true },
  level: { type: String, required: true }, // L1, L2, L3, L4
  assigneeTitle: { type: String, required: true },
  slaDays: { type: Number, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.categoryId) ret.categoryId = ret.categoryId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.categoryId) ret.categoryId = ret.categoryId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

categoryEscalationSchema.virtual('category', {
  ref: 'ComplaintCategory',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

const CategoryEscalation = mongoose.models.CategoryEscalation || mongoose.model('CategoryEscalation', categoryEscalationSchema);
export default CategoryEscalation;
