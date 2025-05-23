// Ref: https://next-auth.js.org/configuration/nextjs#advanced-usage

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";
import { ROLES, ROLE_PATHS } from "@/constants/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    // Admin has access to all paths
    if (token?.role === ROLES.ADMIN) {
      return NextResponse.next();
    }

    // For non-admin users, check path permissions
    const userRole = token?.role?.toLowerCase()||'';
    const allowedPaths = ROLE_PATHS[userRole] || [];
    
    // Check if the current path starts with any of the allowed paths
    const hasAccess = allowedPaths.some(allowedPath => 
      path.startsWith(allowedPath)
    );

    if (!hasAccess) {
      //return NextResponse.redirect(new URL("/unauthorized", req.url));
      return NextResponse.rewrite(
        new URL("/denied", req.url)
    )
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Generate matcher paths from all role paths
// const getAllProtectedPaths = () => {
//   const paths = new Set();
//   Object.values(ROLE_PATHS).forEach(rolePaths => {
//     rolePaths.forEach(path => paths.add(`${path}/:path*`));
//   });
//   return Array.from(paths);
// };
export const config = { matcher: ["/admin/:path*","/student/:path*","/teacher/:path*"] }
// export const config = {
//   matcher: getAllProtectedPaths()
// };
