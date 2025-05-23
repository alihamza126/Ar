import { Schema, model, models } from 'mongoose';
import commonSchema from './Common';

const BookSchema = new Schema({
  ...commonSchema.obj,
  title: {
    type: String,
    required: [true, 'Title is required!'],
  },
  author: {
    type: String,
    required: [true, 'Author is required!'],
  },
  isbn: {
    type: String,
    unique: true,
    required: [true, 'ISBN is required!'],
  },
  genre: {
    type: String,
    required: [true, 'Genre is required!'],
  },
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required!'],
  },
  description: String,
  coverImage: String,
});

const Book = models.Book || model('Book', BookSchema);
export default Book;
