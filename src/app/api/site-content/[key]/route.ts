import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteObject, getPublicURL } from "@/lib/r2";
import { requireAdmin, route } from "@/lib/auth";
import {
  SITE_CONTENT_KEYS,
  isSiteContentKey,
  SiteContentEntry,
} from "@/lib/siteContent";

export const PATCH = route(async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  await requireAdmin();

  const { key } = await context.params;
  if (!isSiteContentKey(key)) {
    return NextResponse.json({ error: "Unknown key" }, { status: 404 });
  }

  const def = SITE_CONTENT_KEYS[key];
  const body = await req.json().catch(() => ({}));

  let nextValue: string;
  if (def.kind === "TEXT") {
    if (typeof body.value !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'value' for TEXT" },
        { status: 400 }
      );
    }
    nextValue = body.value;
  } else {
    if (typeof body.imageKey !== "string" || body.imageKey.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'imageKey' for IMAGE" },
        { status: 400 }
      );
    }
    nextValue = body.imageKey;
  }

  const existing = await prisma.siteContent.findUnique({ where: { key } });

  const updated = await prisma.siteContent.upsert({
    where: { key },
    create: { key, type: def.kind, value: nextValue },
    update: { value: nextValue },
  });

  // If we just replaced an image, delete the previous R2 object.
  if (
    def.kind === "IMAGE" &&
    existing &&
    existing.value &&
    existing.value !== nextValue
  ) {
    try {
      await deleteObject(existing.value);
    } catch (err) {
      console.error("Failed to delete previous site-content image:", err);
    }
  }

  const entry: SiteContentEntry = {
    key,
    type: def.kind,
    value: updated.value,
    url:
      def.kind === "IMAGE" && updated.value
        ? getPublicURL(updated.value)
        : null,
  };

  return NextResponse.json(entry);
});
