// app/api/admin/borrow/route.ts
import { connectToDB } from "@utils/database";
import Borrow from "@models/Borrow";
import BookCopy from "@models/BookCopy";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// GET all active borrows
export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'overdue';
    
    await connectToDB();
    
    const query: any = { 
      isDeleted: false,
      status: 'active',
      dueDate: { $lt: new Date() } // Overdue books
    };

    if (status === 'active') {
      query.dueDate = { $gte: new Date() };
    }

    const borrows = await Borrow.find(query)
      .populate('user')
      .populate({path:'bookCopy', populate: {
        path: 'book',
      } })
      .populate('bookCopy.book')
      // .populate('issuedBy')
      .limit(limit)
      .sort({ dueDate: 1 });

    return NextResponse.json({ data: borrows });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
// POST create new borrow record
export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { user, bookCopy, dueDate } = await req.json();
    await connectToDB();
    
    // Check if book copy is available
    const copy = await BookCopy.findById(bookCopy);
    if (!copy || copy.status !== 'available') {
      return new Response("Book copy not available", { status: 400 });
    }

    const borrow = new Borrow({
      user,
      bookCopy,
      dueDate,
      issuedBy: session.user.id,
      status: 'active'
    });

    await borrow.save();
    
    // Update book copy status
    await BookCopy.findByIdAndUpdate(bookCopy, { status: 'issued' });

    return NextResponse.json(borrow, { status: 201 });
  } catch (error) {
    console.error('Error creating borrow:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
