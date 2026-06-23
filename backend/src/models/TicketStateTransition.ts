import mongoose, { Schema } from 'mongoose';

const ticketStateTransitionSchema = new Schema({
  fromState: { type: String, required: true },
  toState: { type: String, required: true },
  performedBy: { type: String, required: true },
  trigger: { type: String, required: true }
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

const TicketStateTransition = mongoose.models.TicketStateTransition || mongoose.model('TicketStateTransition', ticketStateTransitionSchema);
export default TicketStateTransition;
