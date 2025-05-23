// app/api/admin/reports/[type]/route.ts
import { connectToDB } from "@utils/database";
import Book from "@models/Book";
import User from "@models/User";
import Borrow from "@models/Borrow";
import Fine from "@models/Fine";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

interface ReportQuery {
  isDeleted: boolean;
  status?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}

type ReportType = 'books' | 'users' | 'transactions' | 'fines';

export const GET = async (req: Request, { params }: { params: { type: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    await connectToDB();

    const query: ReportQuery = { isDeleted: false };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data;
    switch(params.type as ReportType) {
      case 'books':
        data = await Book.find(query).populate('createdBy');
        break;
      case 'users':
        data = await User.find(query).populate('role');
        break;
      case 'transactions':
        data = await Borrow.find(query)
          .populate('user')
          .populate('bookCopy')
          .populate('issuedBy');
        break;
      case 'fines':
        data = await Fine.find(query)
          .populate('user')
          .populate('borrow');
        break;
      default:
        return new Response("Invalid report type", { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
