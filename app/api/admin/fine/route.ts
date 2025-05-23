// app/api/admin/fine/route.ts
import { connectToDB } from "@utils/database";
import Fine from "@models/Fine";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// GET all fines
export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'unpaid';
    
    await connectToDB();
    const fines = await Fine.find({ status })
      .populate('user')
      .populate('borrow')
      .populate('createdBy');
    
    return NextResponse.json({ data: fines });
  } catch (error) {
    console.error('Error fetching fines:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
