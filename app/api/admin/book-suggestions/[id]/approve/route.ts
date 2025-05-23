import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions"
import { connectToDB } from "@utils/database"
import BookSuggestion from "@/models/BookSuggestion"
import Notification from "@/models/Notification"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role?.name !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDB()

    const suggestion = await BookSuggestion.findById(params.id).populate("suggestedBy")

    if (!suggestion) {
      return NextResponse.json({ message: "Suggestion not found" }, { status: 404 })
    }

    suggestion.status = "approved"
    suggestion.approvedBy = session.user.id
    suggestion.approvedAt = new Date()

    await suggestion.save()

    // Create notification for the teacher
    await Notification.create({
      message: `Your book suggestion "${suggestion.title}" has been approved!`,
      type: "suggestion",
      userId: suggestion.suggestedBy._id,
      relatedEntity: {
        _id: suggestion._id,
        title: suggestion.title,
      },
    })

    return NextResponse.json({
      message: "Suggestion approved successfully",
      data: suggestion,
    })
  } catch (error) {
    console.error("Error approving suggestion:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
