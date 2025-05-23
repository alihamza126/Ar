import { connectToDB } from "@utils/database";
import BookCopy from "@models/BookCopy";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { book, barcode, location } = await req.json();
console.log('book copy object =>',{ book, barcode, location })
    await connectToDB();

    const newCopy = new BookCopy({
      book: book,
      barcode,
      location,
      createdBy: session.user.id
    });

    await newCopy.save();

    return NextResponse.json(newCopy, { status: 201 });
    
  } catch (error) {
    console.error('Create book copy error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
