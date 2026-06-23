import mongoose, { Schema } from 'mongoose';

const pincodeMappingSchema = new Schema({
  pincode: { type: String, required: true, index: true },
  place: { type: String, required: true },
  district: { type: String, required: true }
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

const PincodeMapping = mongoose.models.PincodeMapping || mongoose.model('PincodeMapping', pincodeMappingSchema);
export default PincodeMapping;
