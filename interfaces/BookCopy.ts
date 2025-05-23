export interface BookCopy {
  _id: string;
  barcode: string;
  status: string;
  location: string;
  book: {
    _id: string;
    title: string;
  };
}
