import { connectToDB } from "@utils/database";
import Book from "@models/Book";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {

      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'createdDate';
    const order = searchParams.get('order') || 'descend';
    const skip = (page - 1) * limit;

    // Create search query
    const searchQuery = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ]
    };

    // Create sort object
    const sortQuery = {
      [sort]: order === 'ascend' ? 1 : -1
    };

    const [books, total] = await Promise.all([
      Book.find(searchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(searchQuery)
    ]);

    return NextResponse.json({
      data: books,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get books error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
