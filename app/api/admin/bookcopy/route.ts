import { connectToDB } from "@utils/database";
import BookCopy from "@models/BookCopy";
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
    const skip = (page - 1) * limit;

    const [copies, total] = await Promise.all([
      BookCopy.find({ isDeleted: false })
        .populate({path:"book"})
        .skip(skip)
        .limit(limit)
        .sort({ createdDate: -1 }),
      BookCopy.countDocuments({ isDeleted: false })
    ]);

    return NextResponse.json({
      data: copies,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get book copies error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
