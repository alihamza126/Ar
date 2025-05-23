import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/authOptions"
import { connectToDB } from "@utils/database"
import BookSuggestion from "@/models/BookSuggestion"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role?.name !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = {}
    if (status) {
      query = { status }
    }

    const suggestions = await BookSuggestion.find(query).sort({ createdAt: -1 }).populate("suggestedBy", "username")

    return NextResponse.json({
      message: "Suggestions fetched successfully",
      data: suggestions,
    })
  } catch (error) {
    console.error("Error fetching book suggestions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
