import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';

const EventSchema = new Schema({
  ...commonSchema.obj,
  title: {
    type: String,
    required: true
  },
  description: String,
  eventDate: Date,
  eventType: {
    type: String,
    enum: ['seminar', 'workshop', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Event = models.Event || model('Event', EventSchema);
export default Event;
