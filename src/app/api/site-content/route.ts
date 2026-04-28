import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicURL } from "@/lib/r2";
import {
  SITE_CONTENT_KEYS,
  SiteContentKey,
  SiteContentEntry,
} from "@/lib/siteContent";

export async function GET() {
  try {
    const rows = await prisma.siteContent.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r]));

    const result: Record<string, SiteContentEntry> = {};
    for (const key of Object.keys(SITE_CONTENT_KEYS) as SiteContentKey[]) {
      const def = SITE_CONTENT_KEYS[key];
      const row = byKey.get(key);
      if (row) {
        result[key] = {
          key,
          type: row.type as "IMAGE" | "TEXT",
          value: row.value,
          url: row.type === "IMAGE" && row.value ? getPublicURL(row.value) : null,
        };
      } else {
        result[key] = {
          key,
          type: def.kind,
          value: def.kind === "TEXT" ? def.fallback : "",
          url: null,
        };
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to load site content:", err);
    return NextResponse.json(
      { error: "Failed to load site content" },
      { status: 500 }
    );
  }
}
