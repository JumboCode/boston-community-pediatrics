import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, route } from "@/lib/auth";
import { deleteUser } from "../[id]/controllers";

// Max volunteers an admin may remove in a single batch. Mirrored on the
// client in src/app/admin/manage/roles/page.tsx (Remove button disabled
// state). Keep these in sync.
const MAX_BATCH_DELETE = 3;

export const POST = route(async (req: NextRequest) => {
  const admin = await requireAdmin();

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

  if (ids.includes(admin.id)) {
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
});
