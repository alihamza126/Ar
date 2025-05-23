// app/api/admin/event/route.ts
import { connectToDB } from "@utils/database";
import Event from "@models/Event";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

interface EventQuery {
  isDeleted: boolean;
  status?: string;
}

// GET all events
export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    await connectToDB();
    
    const query: EventQuery = { isDeleted: false };
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('createdBy')
      .populate('approvedBy');
    
    return NextResponse.json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// POST create new event
export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const eventData = await req.json();
    await connectToDB();
    
    const event = new Event({
      ...eventData,
      createdBy: session.user.id,
      status: 'pending'
    });

    await event.save();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
