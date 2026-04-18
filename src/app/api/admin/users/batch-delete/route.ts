import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUser } from "../[id]/controllers";

// Max volunteers an admin may remove in a single batch
const MAX_BATCH_DELETE = 3;

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const rawIds: unknown = body?.ids;

    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json(
        { error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }
    if (!rawIds.every((id): id is string => typeof id === "string")) {
      return NextResponse.json(
        { error: "ids must all be strings" },
        { status: 400 }
      );
    }

    const ids = Array.from(new Set(rawIds));

    if (ids.length > MAX_BATCH_DELETE) {
      return NextResponse.json(
        {
          error: `Cannot remove more than ${MAX_BATCH_DELETE} users at a time`,
        },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (userId && ids.includes(userId)) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(ids.map((id) => deleteUser(id)));

    const failedIds = results
      .map((r, i) => ({ r, id: ids[i] }))
      .filter(({ r }) => r.status === "rejected")
      .map(({ id }) => id);

    if (failedIds.length > 0) {
      return NextResponse.json(
        { error: "Some deletions failed", failedIds },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Users deleted", count: ids.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("Batch delete failed:", err);
    return NextResponse.json(
      { error: "Failed to batch delete users" },
      { status: 500 }
    );
  }
}
