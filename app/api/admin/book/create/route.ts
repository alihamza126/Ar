import { connectToDB } from "@utils/database";
import Book from "@models/Book";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const POST = async (req: NextRequest) => {
  try {
    console.log("admin is here")
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { 
      title, 
      author, 
      isbn, 
      genre, 
      publicationYear, 
      description 
    } = await req.json();

    await connectToDB();

    const newBook = new Book({
      title,
      author,
      isbn,
      genre,
      publicationYear,
      description,
      createdBy: session.user.id
    });

    await newBook.save();

    return NextResponse.json(newBook, { status: 201 });
    
  } catch (error) {
    console.error('Create book error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
