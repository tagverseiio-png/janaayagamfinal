import mongoose, { Schema } from 'mongoose';

const announcementSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  district: { type: String, default: "All" },
  authorId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.authorId) ret.authorId = ret.authorId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      if (ret.authorId) ret.authorId = ret.authorId.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

announcementSchema.virtual('author', {
  ref: 'Employee',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
export default Announcement;
