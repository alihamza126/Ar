import { connectToDB } from "@utils/database";
import BookCopy from "@models/BookCopy";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const bookCopy = await BookCopy.findById(params.id)
      .populate('book')
      .populate('createdBy', 'username email');

    if (!bookCopy) return new Response("Book copy not found", { status: 404 });

    return NextResponse.json(bookCopy);
    
  } catch (error) {
    console.error('Get book copy error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const updateData = await req.json();
    
    await connectToDB();
    
    const updatedCopy = await BookCopy.findByIdAndUpdate(
      params.id,
      { 
        ...updateData,
        updatedBy: session.user.id,
        updatedDate: Date.now() 
      },
      { new: true }
    ).populate('book');

    if (!updatedCopy) return new Response("Book copy not found", { status: 404 });

    return NextResponse.json(updatedCopy);
    
  } catch (error) {
    console.error('Update book copy error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const deletedCopy = await BookCopy.findByIdAndUpdate(
      params.id,
      { 
        isDeleted: true,
        deletedDate: Date.now(),
        deletedBy: session.user.id 
      },
      { new: true }
    );

    if (!deletedCopy) return new Response("Book copy not found", { status: 404 });

    return new Response("Book copy deleted successfully", { status: 200 });
    
  } catch (error) {
    console.error('Delete book copy error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
