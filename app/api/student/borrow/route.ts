// app/api/student/borrow/route.ts
import { connectToDB } from "@utils/database";
import BookCopy from "@models/BookCopy";
import Borrow from "@models/Borrow";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const borrows = await Borrow.find({ 
      user: session.user.id,
      status: { $in: ['active', 'overdue'] }
    })
    .populate({
      path: 'bookCopy',
      populate: {
        path: 'book',
        select: 'title author'
      }
    })
    .sort({ dueDate: 1 });

    return NextResponse.json({ data: borrows });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { bookId, dueDate } = await req.json();
    await connectToDB();
    
    // Find an available copy
    const availableCopy = await BookCopy.findOne({
      book: bookId,
      status: 'available'
    });

    if (!availableCopy) {
      return new Response("No available copies of this book", { status: 400 });
    }

    // Create borrow record
    const borrow = new Borrow({
      user: session.user.id,
      bookCopy: availableCopy._id,
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'active'
    });

    await borrow.save();
    
    // Update book copy status
    await BookCopy.findByIdAndUpdate(availableCopy._id, { status: 'issued' });

    return NextResponse.json(borrow, { status: 201 });
  } catch (error) {
    console.error('Error creating student borrow:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
