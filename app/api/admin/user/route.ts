// app/api/admin/user/route.ts
import { connectToDB } from "@utils/database";
import User from "@models/User";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";
import { encrypt } from "@utils/common";

// GET all users
export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const users = await User.find({ isDeleted: false }).populate('role');
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// POST create new user
export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { username, email, password, role } = await req.json();
    await connectToDB();
    const hashed = encrypt(password);
    
    const user = new User({
      username,
      email,
      password:hashed,
      role,
      createdBy: session.user.id
    });

    await user.save();
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
