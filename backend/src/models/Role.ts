import mongoose, { Schema } from 'mongoose';

const roleSchema = new Schema({
  code: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  adminLevel: { type: String, required: true },
  jurisdictionScope: { type: String, required: true },
  description: { type: String, required: true }
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

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
export default Role;
