// app/api/books/available/route.ts
import { connectToDB } from "@utils/database";
import Book from "@models/Book";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    await connectToDB();

    // Get all books with available copies
    const books = await Book.aggregate([
      {
        $lookup: {
          from: "bookcopies",
          localField: "_id",
          foreignField: "book",
          as: "copies",
        },
      },
      {
        $addFields: {
          availableCopies: {
            $size: {
              $filter: {
                input: "$copies",
                as: "copy",
                cond: { $eq: ["$$copy.status", "available"] },
              },
            },
          },
        },
      },
      {
        $match: {
          availableCopies: { $gt: 0 },
        },
      },
      {
        $project: {
          copies: 0,
        },
      },
    ]);

    return NextResponse.json({ data: books });
  } catch (error) {
    console.error("Error fetching available books:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
