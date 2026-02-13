import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserById } from "@/app/api/users/controller";
import { UserRole } from "@prisma/client";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Only protect /admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {

    if (!userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const user = await getUserById(userId);

    if (user && user.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*", // Add this to protect API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*))",
  ],
};
