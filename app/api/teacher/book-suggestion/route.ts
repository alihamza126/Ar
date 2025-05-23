import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";
import { connectToDB } from "@utils/database";
import BookSuggestion from "@/models/BookSuggestion";
import Notification from "@/models/Notification";

export async function POST(request: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (session.user.role?.name !== "teacher") {
         return NextResponse.json(
            { message: "Only teachers can suggest books" },
            { status: 403 }
         );
      }

      await connectToDB();

      const body = await request.json();
      console.log(body);
      const {
         title,
         author,
         isbn,
         genre,
         publicationYear,
         reason,
         priority,
         coverImage,
      } = body;

      const suggestion = new BookSuggestion({
         title,
         author,
         isbn,
         genre,
         publicationYear,
         reason,
         priority: priority || "medium",
         coverImage,
         suggestedBy: session.user.id,
         status: "pending",
      });

      await suggestion.save();

      // Create notification for admin
      await Notification.create({
         user: session?.user?.id,
         message: `New book suggestion:asdfasdf`,
         type: "reservation",
         relatedEntity: suggestion._id,
         entityModel: "Book",
      });

      return NextResponse.json(
         {
            message: "Book suggestion submitted successfully",
            data: suggestion,
         },
         { status: 201 }
      );
   } catch (error) {
      console.log("Error creating book suggestion:", error);
      return NextResponse.json(
         { message: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function GET(request: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (session.user.role?.name !== "teacher") {
         return NextResponse.json(
            { message: "Only teachers can view their suggestions" },
            { status: 403 }
         );
      }

      await connectToDB();

      const suggestions = await BookSuggestion.find({
         suggestedBy: session.user.id,
      })
         .sort({ createdAt: -1 })
         .populate("suggestedBy", "username");

      return NextResponse.json({
         message: "Suggestions fetched successfully",
         data: suggestions,
      });
   } catch (error) {
      console.error("Error fetching book suggestions:", error);
      return NextResponse.json(
         { message: "Internal server error" },
         { status: 500 }
      );
   }
}
