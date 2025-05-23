// app/api/admin/stats/route.ts
import { connectToDB } from "@utils/database";
import Book from "@models/Book";
import BookCopy from "@models/BookCopy";
import User from "@models/User";
import Event from "@models/Event";
import Fine from "@models/Fine";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const [
      totalBooks,
      availableBooks,
      issuedBooks,
      totalUsers,
      pendingEvents,
      unpaidFines
    ] = await Promise.all([
      Book.countDocuments({ isDeleted: false }),
      BookCopy.countDocuments({ status: 'available', isDeleted: false }),
      BookCopy.countDocuments({ status: 'issued', isDeleted: false }),
      User.countDocuments({ isDeleted: false }),
      Event.countDocuments({ status: 'pending', isDeleted: false }),
      Fine.aggregate([
        { $match: { status: 'unpaid', isDeleted: false } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    return NextResponse.json({
      totalBooks,
      availableBooks,
      issuedBooks,
      totalUsers,
      pendingEvents,
      unpaidFines: unpaidFines[0]?.total || 0
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
