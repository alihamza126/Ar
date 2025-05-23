import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@models/User';
import { connectToDB } from '@/utils/database';
import { encrypt, generatePassword } from '@utils/common';
import mongoose from 'mongoose';
import UserRole from '@models/UserRole';
import { ROLE_PROFILE_MAPPING } from '@constants/roles';

const generateUniqueUsername = async (name) => {
  // 1. Sanitize the base username
  const baseUsername = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')      // Remove all whitespace
    .replace(/[^a-z0-9._]/g, '') // Remove invalid characters
    .replace(/^[_.]+/, '')    // Remove leading special chars
    .replace(/[_.]+$/, '')    // Remove trailing special chars
    .replace(/[_.]{2,}/g, '_') // Limit consecutive special chars
    .slice(0, 30);            // Leave room for uniqueness suffix

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
const getProfileByRole = async (userId, role) => {
  const roleMapping = ROLE_PROFILE_MAPPING[role?.toLowerCase()];

  if (!roleMapping) return null;

  try {
    const Model = mongoose.model(roleMapping.model);
    let query = Model.findOne({ user: userId });
    if (roleMapping.populate) {
      roleMapping.populate.forEach(field => {
        query = query.populate(field);
      });
    }
    const res = await query.exec();
    return res;
  } catch (error) {
    console.error(`Error fetching profile for role ${role}:`, error);
    return null;
  }
}
const getUserData = async (filter) => {
  let baseQuery = {
    ...(filter.password ? { password: filter.password } : null),
    $or: [
      { email: filter?.email?.toLowerCase() },
      { username: filter?.email.toLowerCase() },
    ]
  };
  try {
    connectToDB();
    const user = await User.findOne(baseQuery)
      .populate({ path: 'role', select: '_id name', match: { _id: { $ne: null } } })

    const roleProfile = await getProfileByRole(user?._id, user?.role.name.toLowerCase());
    if (roleProfile) {
      user.profile = roleProfile;
    }

    return user;
  }
  catch (err) {
    console.log('error => ', err)
    return null
  }

}
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      id: "domain-login",
      name: "Domain Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "abc@xyz.com" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {

        try {
          const user = await getUserData({
            email: credentials.username,
            password: (encrypt(credentials.password))
          })
          if (user) {
            return {
              image: user.image,
              picture: user.image,
              name: user?.username,
              email: user?.email,
              id: user._id,
              role: user.role?.name,
              roleId: user.role?._id,
              profile: user.profile,
            }
          }
          else {
            return null
          }
        }
        catch (err) {
          console.log('error => ', err)
          return null
        }

      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session }) {
      const sessionUser = await getUserData({ email: session.user.email })
      session.user.id = sessionUser._id.toString();
      session.user.profile = sessionUser.profile;
      session.user.role = sessionUser.role;
      session.user.roleId = sessionUser.role._id;
      return session;
    },
    async signIn({ account, profile, user }) {
      try {
        if (account.provider === 'domain-login') {
          // Domain login logic (if any)
        } else {
          console.log('db connectiong')

          await connectToDB();
          console.log('db connected')
          let userExists = await getUserData({ email: profile.email });
          // Create new user if doesn't exist
          if (!userExists) {
            const publicUserRole = await UserRole.findOne({ name: 'student' });
            if (!publicUserRole) throw new Error("'student' role not found");
            const password = encrypt(generatePassword());
            const uniqueUsername = await generateUniqueUsername(profile.name);

            await User.create({
              email: profile.email,
              username: uniqueUsername,
              image: profile.picture,
              role: publicUserRole._id,
              password,
            });

            // Fetch the full user data with populated fields
            userExists = await getUserData({ email: profile.email });
          }

          // Attach user data to the session
          user.id = userExists._id.toString();
          user.role = userExists.role?.name;
          user.profile = userExists.profile;
        }
        return true;
      } catch (error) {
        console.error("Sign-in error:", error.message);
        return false;
      }
    },
  },
}