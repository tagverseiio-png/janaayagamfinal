import mongoose, { Schema } from 'mongoose';

const zoneSchema = new Schema({
  zoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  region: { type: String, required: true },
  wardFrom: { type: Number, required: true },
  wardTo: { type: Number, required: true }
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

const Zone = mongoose.models.Zone || mongoose.model('Zone', zoneSchema);
export default Zone;
