import mongoose, { Schema } from 'mongoose';

const jurisdictionSchema = new Schema({
  level: { type: String, required: true }, // e.g., 'STATE', 'DISTRICT', 'TALUK', 'BLOCK', 'WARD', 'VILLAGE'
  name: { type: String, required: true }, // e.g., 'Chennai', 'Ward 12'
  parentId: { type: Schema.Types.ObjectId, ref: 'Jurisdiction', default: null },
  track: { type: String }, // URBAN, RURAL, REVENUE
  lat: { type: Number },
  lng: { type: Number }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.parentId) ret.parentId = ret.parentId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.parentId) ret.parentId = ret.parentId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

jurisdictionSchema.virtual('parent', {
  ref: 'Jurisdiction',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

jurisdictionSchema.virtual('children', {
  ref: 'Jurisdiction',
  localField: '_id',
  foreignField: 'parentId'
});

jurisdictionSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'jurisdictionId'
});

jurisdictionSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'jurisdictionId'
});

const Jurisdiction = mongoose.models.Jurisdiction || mongoose.model('Jurisdiction', jurisdictionSchema);
export default Jurisdiction;
