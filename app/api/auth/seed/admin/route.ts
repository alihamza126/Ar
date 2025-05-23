import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { encrypt } from "@/utils/common";
import { generateUniqueUsername } from "../../register/route";

// Protect with a secret header: ADMIN_SECRET
export async function POST(request: NextRequest) {
   const secret = request.headers.get("x-admin-secret");
   if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
   }

   try {
      // Get credentials from request body instead of hardcoding
      const requestData = await request.json();
      const { name, email, password: rawPassword } = requestData;

      // Validate required fields
      if (!name || !email || !rawPassword) {
         return NextResponse.json(
            { message: "Name, email, and password are required" },
            { status: 400 }
         );
      }

      await connectToDB();

      // Check if admin already exists
      if (await User.findOne({ email })) {
         return NextResponse.json(
            { message: "Admin already exists" },
            { status: 200 }
         );
      }

      const password = encrypt(rawPassword);
      const username = await generateUniqueUsername(name);

      let role = await UserRole.findOne({ name: "admin" });
      if (!role) {
         role = await UserRole.create({ name: "admin", permissions: ["all"] });
      }

      let sRole = await UserRole.findOne({ name: "student" });
      if (!sRole) {
         await UserRole.create({ name: "student", permissions: ["all"] });
      }

      let tRole = await UserRole.findOne({ name: "teacher" });
      if (!tRole) {
         await UserRole.create({ name: "teacher", permissions: ["all"] });
      }

      const user = await User.create({
         name,
         email,
         username,
         password,
         role: role._id,
         isVerified: true,
      });

      return NextResponse.json(
         { message: "Admin created", userId: user._id },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating admin:", error);
      return NextResponse.json(
         { message: "Error creating admin", error: error.message },
         { status: 500 }
      );
   }
}
