import mongoose, { Schema } from 'mongoose';

const ticketClaimSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  citizenId: { type: Schema.Types.ObjectId, ref: 'Citizen', required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.ticketId) ret.ticketId = ret.ticketId.toString();
      if (ret.citizenId) ret.citizenId = ret.citizenId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.ticketId) ret.ticketId = ret.ticketId.toString();
      if (ret.citizenId) ret.citizenId = ret.citizenId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound unique index
ticketClaimSchema.index({ ticketId: 1, citizenId: 1 }, { unique: true });

ticketClaimSchema.virtual('ticket', {
  ref: 'Ticket',
  localField: 'ticketId',
  foreignField: '_id',
  justOne: true
});

ticketClaimSchema.virtual('citizen', {
  ref: 'Citizen',
  localField: 'citizenId',
  foreignField: '_id',
  justOne: true
});

const TicketClaim = mongoose.models.TicketClaim || mongoose.model('TicketClaim', ticketClaimSchema);
export default TicketClaim;
