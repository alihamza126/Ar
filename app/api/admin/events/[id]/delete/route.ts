// app/api/admin/event/[id]/approve/route.ts

import { connectToDB } from "@utils/database";
import Event from "@models/Event";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// DELETE event
export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const deletedEvent = await Event.findByIdAndUpdate(
      params.id,
      {
        isDeleted: true,
        deletedBy: session.user.id,
        deletedDate: Date.now()
      },
      { new: true }
    );

    if (!deletedEvent) return new Response("Event not found", { status: 404 });

    return new Response("Event deleted successfully", { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
