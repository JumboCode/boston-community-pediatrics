import { NextResponse } from "next/server";
import { getPresignedURL } from "@/lib/r2";
import { requireAdmin, route } from "@/lib/auth";
import { SITE_CONTENT_KEYS, isSiteContentKey } from "@/lib/siteContent";

export const POST = route(async function POST(
  _req: Request,
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

  const objectKey = `site/${key}/${crypto.randomUUID()}`;
  const url = await getPresignedURL(objectKey);

  return NextResponse.json({ key: objectKey, url });
});
