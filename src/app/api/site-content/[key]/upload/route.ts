import { NextResponse } from "next/server";
import { getPresignedURL } from "@/lib/r2";
import { requireAdmin, route } from "@/lib/auth";
import { SITE_CONTENT_KEYS, isSiteContentKey } from "@/lib/siteContent";
import { checkAndIncrementStorage } from "@/lib/r2Storage";

const MAX_SITE_CONTENT_SIZE = 5 * 1024 * 1024; // 5 MB

export const POST = route(async function POST(
  req: Request,
  context: { params: Promise<{ key: string }> }
) {
  await requireAdmin();

  const { key } = await context.params;
  if (!isSiteContentKey(key)) {
    return NextResponse.json({ error: "Unknown key" }, { status: 404 });
  }

  if (SITE_CONTENT_KEYS[key].kind !== "IMAGE") {
    return NextResponse.json(
      { error: "Key is not an image" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const fileSizeBytes = Number(body.fileSizeBytes);
  if (!fileSizeBytes || fileSizeBytes > MAX_SITE_CONTENT_SIZE) {
    return NextResponse.json(
      { error: "File must be 5MB or less." },
      { status: 400 }
    );
  }

  const allowed = await checkAndIncrementStorage(fileSizeBytes);
  if (!allowed) {
    return NextResponse.json(
      { error: "Storage limit reached. No new uploads can be accepted." },
      { status: 507 }
    );
  }

  const objectKey = `site/${key}/${crypto.randomUUID()}`;
  const url = await getPresignedURL(objectKey);

  return NextResponse.json({ key: objectKey, url });
});
