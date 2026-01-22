import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./lib/auth";

const isProtectedRoute = createRouteMatcher(['/admin(.*)','/event/createEvent(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Restrict admin routes to users with specific Permissions
  if (isProtectedRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:admin:example1' }) || has({ permission: 'org:admin:example2' })
    })
  }
})

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all routes except static files
    "/api/(.*)", // ALL api routes
  ],
};


