import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';
import Book from './Book';

const BookCopySchema = new Schema({
  ...commonSchema.obj,
  book: {
    type: Schema.Types.ObjectId,
    ref: Book,
    required: true
  },
  barcode: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'issued', 'reserved', 'damaged'],
    default: 'available'
  },
  location: String
});

const BookCopy = models.BookCopy || model('BookCopy', BookCopySchema);
export default BookCopy;
