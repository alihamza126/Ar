// app/api/admin/borrow/[id]/return/route.ts
import { connectToDB } from "@utils/database";
import Borrow from "@models/Borrow";
import BookCopy from "@models/BookCopy";
import Fine from "@models/Fine";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// POST return a book
export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { fineAmount } = await req.json();
    await connectToDB();
    
    const borrow = await Borrow.findById(params.id)
      .populate('bookCopy')
      .populate('user');
    
    if (!borrow) return new Response("Borrow record not found", { status: 404 });

    // Update borrow record
    borrow.returnDate = new Date();
    borrow.status = 'returned';
    await borrow.save();

    // Update book copy status
    await BookCopy.findByIdAndUpdate(borrow.bookCopy._id, { status: 'available' });

    // Create fine record if applicable
    if (fineAmount > 0) {
      const fine = new Fine({
        user: borrow.user._id,
        borrow: borrow._id,
        amount: fineAmount,
        status: 'unpaid',
        createdBy: session.user.id
      });
      await fine.save();
    }

    return NextResponse.json(borrow);
  } catch (error) {
    console.error('Error processing book return:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
