import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./lib/auth";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all routes except static files
    "/api/(.*)", // ALL api routes
  ],
};


