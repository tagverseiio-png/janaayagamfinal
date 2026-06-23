import mongoose, { Schema } from 'mongoose';

const cabinetReportSchema = new Schema({
  title: { type: String, required: true },
  summaryText: { type: String, required: true },
  rankings: { type: String, required: true } // Store as JSON string to maintain Prisma contract
}, {
  timestamps: { createdAt: true, updatedAt: false },
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

const CabinetReport = mongoose.models.CabinetReport || mongoose.model('CabinetReport', cabinetReportSchema);
export default CabinetReport;
