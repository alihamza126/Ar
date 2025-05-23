import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';

const NotificationSchema = new Schema({
  ...commonSchema.obj,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['reservation', 'overdue', 'general']
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    enum: ['Book', 'Borrow', 'Reservation']
  }
});

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
