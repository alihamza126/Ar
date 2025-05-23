import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';

const ReservationSchema = new Schema({
  ...commonSchema.obj,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'fulfilled'],
    default: 'active'
  }
});

const Reservation = models.Reservation || model('Reservation', ReservationSchema);
export default Reservation;
