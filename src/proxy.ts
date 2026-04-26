import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserById } from "@/app/api/users/controller";
import { UserRole } from "@prisma/client";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) return;

  // Not signed in
  if (!userId) {
    return isAdminApi
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/", req.url));
  }

  const user = await getUserById(userId);

  // Signed in but not an admin
  if (!user || user.role !== UserRole.ADMIN) {
    return isAdminApi
      ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*", // Add this to protect API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*))",
  ],
};
