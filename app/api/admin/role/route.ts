// app/api/admin/roles/route.ts
import { connectToDB } from "@utils/database";
import UserRole from "@models/UserRole";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const roles = await UserRole.find({}); // fetch all roles

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
