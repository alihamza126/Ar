// app/api/admin/user/[id]/route.ts
import { connectToDB } from "@utils/database";
import User from "@models/User";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

// GET user by ID
export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const user = await User.findById(params.id).populate('role');
    if (!user) return new Response("User not found", { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// PATCH update user
export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    const updateData = await req.json();
    await connectToDB();
    
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { 
        ...updateData,
        updatedBy: session.user.id,
        updatedDate: new Date()
      },
      { new: true }
    );

    if (!updatedUser) return new Response("User not found", { status: 404 });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// DELETE user (soft delete)
export const DELETE = async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role?.name?.includes('admin')) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const deletedUser = await User.findByIdAndUpdate(
      params.id,
      { 
        isDeleted: true,
        deletedDate: new Date(),
        deletedBy: session.user.id
      },
      { new: true }
    );

    if (!deletedUser) return new Response("User not found", { status: 404 });
    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
