import { connectToDB } from "@/utils/database";
import Book from "@/models/Book";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role?.name !== "admin") {
    return null;
  }
  return session;
}

// GET handler
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await isAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    await connectToDB();
    const book = await Book.findById(params.id);
    if (!book) return new Response("Book not found", { status: 404 });
    return NextResponse.json(book);
  } catch (error) {
    console.error("Get book error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PATCH handler
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await isAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const updateData = await request.json();
    await connectToDB();

    const updatedBook = await Book.findByIdAndUpdate(
      params.id,
      {
        ...updateData,
        updatedBy: session.user.id,
        updatedDate: Date.now(),
      },
      { new: true }
    );

    if (!updatedBook) return new Response("Book not found", { status: 404 });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Update book error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE handler
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await isAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    await connectToDB();

    const deletedBook = await Book.findByIdAndUpdate(
      params.id,
      {
        isDeleted: true,
        deletedDate: Date.now(),
        deletedBy: session.user.id,
      },
      { new: true }
    );

    if (!deletedBook) return new Response("Book not found", { status: 404 });

    return new Response("Book deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Delete book error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
