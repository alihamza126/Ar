import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';

const FineSchema = new Schema({
  ...commonSchema.obj,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrow: {
    type: Schema.Types.ObjectId,
    ref: 'Borrow',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  paidDate: Date
});

const Fine = models.Fine || model('Fine', FineSchema);
export default Fine;
