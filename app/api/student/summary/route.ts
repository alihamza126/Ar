import { connectToDB } from "@utils/database"; // Your DB connection utility
import User from "@models/User"; // Your Mongoose User model
import Book from "@models/Book"; // Your Mongoose Book model
import BookCopy from "@models/BookCopy"; // Your Mongoose BookCopy model (for reserved/borrowed books)
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

    const userId = session.user.id; // Assuming user ID is stored in session

    // Get student data (total borrowed and reserved books)
    const borrowedBooks = await BookCopy.countDocuments({
      user: userId,
      status: "borrowed",
    });

    const reservedBooks = await BookCopy.countDocuments({
      user: userId,
      status: "reserved",
    });

    // Get student details (this can include their name, email, etc.)
    const studentDetails = await User.findById(userId, "username email");
    console.log(studentDetails);   
    return NextResponse.json({
      data: {
        studentDetails,
        borrowedBooks,
        reservedBooks,
      },
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
