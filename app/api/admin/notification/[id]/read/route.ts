// app/api/admin/notification/[id]/read/route.ts
import { connectToDB } from "@utils/database";
import Notification from "@models/Notification";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// PATCH mark notification as read
export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) return new Response("Notification not found", { status: 404 });
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
