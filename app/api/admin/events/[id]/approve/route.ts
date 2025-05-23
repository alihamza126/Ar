// app/api/admin/event/[id]/approve/route.ts
import { connectToDB } from "@utils/database";
import Event from "@models/Event";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// PATCH approve event
export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const event = await Event.findByIdAndUpdate(
      params.id,
      { 
        status: 'approved',
        approvedBy: session.user.id,
        updatedBy: session.user.id
      },
      { new: true }
    );

    if (!event) return new Response("Event not found", { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error approving event:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
