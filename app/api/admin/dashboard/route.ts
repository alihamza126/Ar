import { connectToDB } from "@utils/database"; // Your DB connection utility
import User from "@models/User"; // Your Mongoose User model
import Book from "@models/Book"; // Your Mongoose Book model
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions"; // Your auth options

export const GET = async () => {
  try {
    // Get the session to check if the user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDB();

    // Get the total number of users
    const totalUsers = await User.countDocuments();

    // Get the number of active users
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Get the total number of books
    const totalBooks = await Book.countDocuments();

    // Get the number of reserved books
    const reservedBooks = await Book.aggregate([
      {
        $lookup: {
          from: "bookcopies",
          localField: "_id",
          foreignField: "book",
          as: "copies",
        },
      },
      {
        $unwind: "$copies",
      },
      {
        $match: { "copies.status": "reserved" },
      },
      {
        $group: {
          _id: null,
          reservedBooksCount: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      data: {
        totalUsers,
        activeUsers,
        totalBooks,
        reservedBooks: reservedBooks.length > 0 ? reservedBooks[0].reservedBooksCount : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
