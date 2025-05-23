import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";
import User from "@/models/User";
import Event from "@/models/Event";
import { connectToDB } from "@/utils/database";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const { title, description, eventDate, eventType } = await req.json();
  if (!title || !eventType) {
    return NextResponse.json({ error: "Title and eventType are required" }, { status: 400 });
  }

  const newEvent = await Event.create({
    title,
    description,
    eventDate,
    eventType,
    createdBy: session.user.id,
  });

  return NextResponse.json(newEvent, { status: 201 });
}

export async function GET(req: NextRequest) {
  // Optional: list all events or teacher's events
  await connectToDB();
  const events = await Event.find().populate("createdBy", "username");
  return NextResponse.json(events);
}
