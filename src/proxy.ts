import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./lib/auth";
import { getUserById } from "@/app/api/users/controller";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/event/createEvent(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  // If not a protected route allow user to continue
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

    // await auth.protect((has) => {
    //   return has({ permission: 'org:admin:example1' }) || has({ permission: 'org:admin:example2' })
    // })
    const { userId } = await auth();
    if (!userId) return null;
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentUser = await getUserById(user.id);
    // const currentUser = await getCurrentUser();
    

    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        return NextResponse.next();
      }
    }
    const homeURL = new URL('/', req.url);
    return NextResponse.redirect(homeURL);
  
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all routes except static files
    "/api/(.*)", // ALL api routes
  ],
};
