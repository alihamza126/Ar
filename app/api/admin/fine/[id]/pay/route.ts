// app/api/admin/fine/[id]/pay/route.ts
import { connectToDB } from "@utils/database";
import Fine from "@models/Fine";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// POST mark fine as paid
export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const fine = await Fine.findByIdAndUpdate(
      params.id,
      { 
        status: 'paid',
        paidDate: new Date(),
        updatedBy: session.user.id
      },
      { new: true }
    );

    if (!fine) return new Response("Fine not found", { status: 404 });
    return NextResponse.json(fine);
  } catch (error) {
    console.error('Error marking fine as paid:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
