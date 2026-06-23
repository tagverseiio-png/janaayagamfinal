import mongoose, { Schema } from 'mongoose';

const citizenSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  district: { type: String },
  isVolunteer: { type: Boolean, default: false },
  volunteerWard: { type: String },
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

// Virtual relations to match Prisma's field properties if queried directly
citizenSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'citizenId'
});

citizenSchema.virtual('claims', {
  ref: 'TicketClaim',
  localField: '_id',
  foreignField: 'citizenId'
});

const Citizen = mongoose.models.Citizen || mongoose.model('Citizen', citizenSchema);
export default Citizen;
