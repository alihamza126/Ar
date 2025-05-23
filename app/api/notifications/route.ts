// app/api/notifications/route.ts
import { connectToDB } from "@utils/database";
import Notification from "@models/Notification";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const notifications = await Notification.find({ 
      user: session.user.id 
    }).sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
