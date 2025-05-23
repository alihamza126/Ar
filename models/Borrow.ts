import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';
import Fine from './Fine';

const BorrowSchema = new Schema({
  ...commonSchema.obj,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookCopy: {
    type: Schema.Types.ObjectId,
    ref: 'BookCopy',
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  fineAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  }
});
// Add pre-save hook to validate borrowing rules
BorrowSchema.pre('save', async function(next) {
  const user = this.user;

  const borrowCount = await this.model('Borrow').countDocuments({ 
    user, 
    status: 'active' 
  });

  if (borrowCount >= 3) {
    throw new Error('You have reached the maximum borrowing limit (3 books)');
  }

  const unpaidFines = await Fine.countDocuments({
    user,
    status: 'unpaid'
  });

  if (unpaidFines > 0) {
    throw new Error('You have unpaid fines. Please clear them first.');
  }

  next();
});

const Borrow = models.Borrow || model('Borrow', BorrowSchema);
export default Borrow;
