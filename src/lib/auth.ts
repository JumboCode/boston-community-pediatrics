import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import { NextResponse } from "next/server";
import { User, UserRole } from "@prisma/client";
import { getUserById } from "@/app/api/users/controller";

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return await getUserById(user.id);
});

// require a signed-in user with a matching DB record
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

// require a signed-in user who is also an ADMIN
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

// require a signed-in user who either matches `targetUserId` or is an ADMIN
export async function requireSelfOrAdmin(targetUserId: string): Promise<User> {
  const user = await requireUser();
  if (user.id !== targetUserId && user.role !== UserRole.ADMIN) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

// require a signed-in user who owns the given resource (or is an ADMIN)
export async function requireOwnerOrAdmin<T extends { userId: string | null }>(
  loader: () => Promise<T | null>
): Promise<{ user: User; resource: T }> {
  const user = await requireUser();
  const resource = await loader();
  if (!resource) {
    throw NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (resource.userId !== user.id && user.role !== UserRole.ADMIN) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { user, resource };
}

// make nextresponses become actual HTTP responses instead of unhandled errors
export function route<H extends (...args: never[]) => Promise<Response>>(
  handler: H
): H {
  return (async (...args: Parameters<H>) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof Response) return err;
      console.error("Unhandled route error:", err);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }) as H;
}
