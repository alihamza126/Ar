// app/api/notifications/mark-all-read/route.ts
import { connectToDB } from "@utils/database";
import Notification from "@models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const PATCH = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    await Notification.updateMany(
      {
        user: session.user.id,
        read: false
      },
      { read: true }
    );

    return new Response("All notifications marked as read", { status: 200 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
