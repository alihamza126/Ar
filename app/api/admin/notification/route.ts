// app/api/admin/notification/route.ts
import { connectToDB } from "@utils/database";
import Notification from "@models/Notification";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

interface NotificationQuery {
  user: string;
  read?: boolean;
}

// GET all notifications
export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const read = searchParams.get('read');
    
    await connectToDB();
    
    const query: NotificationQuery = { user: session.user.id };
    if (read) query.read = read === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdDate: -1 })
      .limit(20);
    
    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
