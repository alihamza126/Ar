// app/api/student/borrow/route.ts
import { connectToDB } from "@utils/database";
import { NextRequest, NextResponse } from "next/server";
import Event from "@models/Event";

export async function GET(req: NextRequest) {
   await connectToDB();
   const events = await Event.find({ status: "approved" })
      .select("title description eventDate eventType status createdBy")
      .populate("createdBy", "username");
   return NextResponse.json(events);
}
