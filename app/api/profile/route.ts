// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@utils/database";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";
import User from "@/models/User";
import Borrow from "@/models/Borrow";
import Fine from "@/models/Fine";
import { encrypt, decrypt } from "@utils/common";

// GET /api/profile - Get current user profile with borrows and fines
export async function GET(req: NextRequest) {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectToDB();

      // Find user with their role
      const user = await User.findOne({ email: session.user.email })
         .populate("role")
         .lean();

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // If user is a student, get their borrows and fines
      if (user.role.name === "student") {
         // Get borrows
         const borrows = await Borrow.find({ user: user._id })
            .populate({
               path: "bookCopy",
               populate: {
                  path: "book",
                  select: "title",
               },
            })
            .lean();

         // Get fines
         const fines = await Fine.find({ user: user._id })
            .populate({
               path: "borrow",
               populate: {
                  path: "bookCopy",
                  populate: {
                     path: "book",
                     select: "title",
                  },
               },
            })
            .lean();

         user.borrows = borrows;
         user.fines = fines;
      }

      return NextResponse.json(user);
   } catch (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

// PATCH /api/profile - Update user profile
export async function PATCH(req: NextRequest) {
   const session = await getServerSession(authOptions);
   if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   const body = await req.json();
   await connectToDB();

   // Fetch user including encrypted password
   const user = await User.findById(session.user.id).select("+password");
   if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
   }

   const { currentPassword, newPassword, confirmPassword, username, email } =
      body;

   // Password change flow using encrypt/decrypt
   if (currentPassword !== undefined && newPassword && confirmPassword) {
      const decryptedCurrent = decrypt(currentPassword);
      const decryptedStored = decrypt(user.password);

      if (decryptedCurrent !== decryptedStored) {
         return NextResponse.json(
            { error: "Current password incorrect" },
            { status: 400 }
         );
      }

      if (newPassword !== confirmPassword) {
         return NextResponse.json(
            { error: "New passwords do not match" },
            { status: 400 }
         );
      }

      // Encrypt and save new password
      user.password = encrypt(newPassword);
      user.passwordChangedAt = new Date();
      await user.save();
      return NextResponse.json({ message: "Password updated" });
   }

   // Profile update flow
   const updates: any = {};
   if (username !== undefined) updates.username = username;
   if (email !== undefined) updates.email = email;
   if (Object.keys(updates).length) {
      updates.updatedDate = new Date();
      updates.updatedBy = session.user.id;
      const updatedUser = await User.findByIdAndUpdate(
         session.user.id,
         updates,
         { new: true }
      )
         .select("-password")
         .populate("role", "name");

      return NextResponse.json(updatedUser);
   }

   return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
   );
}
