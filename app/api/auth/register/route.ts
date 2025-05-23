import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { encrypt } from "@/utils/common";

export const generateUniqueUsername = async (name: string) => {
   // 1. Sanitize the base username
   const baseUsername = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "") // Remove all whitespace
      .replace(/[^a-z0-9._]/g, "") // Remove invalid characters
      .replace(/^[_.]+/, "") // Remove leading special chars
      .replace(/[_.]+$/, "") // Remove trailing special chars
      .replace(/[_.]{2,}/g, "_") // Limit consecutive special chars
      .slice(0, 30); // Leave room for uniqueness suffix

   // 2. Check for existing usernames and append unique suffix
   let counter = 1;
   let candidate = baseUsername;

   while (await User.exists({ username: candidate })) {
      const suffix = `_${counter}`;
      candidate = `${baseUsername.slice(0, 35 - suffix.length)}${suffix}`;
      counter++;

      // Fallback for extreme cases
      if (counter > 100) {
         const random = Math.floor(Math.random() * 900 + 100); // 3-digit random
         candidate = `user_${random}`;
         break;
      }
   }

   return candidate;
};

export async function POST(request: NextRequest) {
   const { name, email, password } = await request.json();

   if (!name || !email || !password) {
      return NextResponse.json(
         { message: "Missing required fields" },
         { status: 400 }
      );
   }

   try {
      await connectToDB();

      // 1. Check if email already exists
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
         return NextResponse.json(
            { message: "Email already registered" },
            { status: 409 }
         );
      }

      // 2. Hash the password
      const hashed = encrypt(password);

      // 3. Create unique username
      const username = await generateUniqueUsername(name);

      // 4. Assign default role
      let defaultRole = await UserRole.findOne({ name: "student" });
      if (!defaultRole) {
         defaultRole = await UserRole.create({ name: "student" });
      }

      // 5. Create user
      const newUser = await User.create({
         name,
         email: email.toLowerCase(),
         username,
         password: hashed,
         role: defaultRole._id,
      });

      return NextResponse.json(
         { message: "User created", userId: newUser._id },
         { status: 201 }
      );
   } catch (err) {
      console.error("Registration error", err);
      return NextResponse.json(
         { message: "Internal server error" },
         { status: 500 }
      );
   }
}
