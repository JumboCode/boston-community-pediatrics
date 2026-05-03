
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server"

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const provided = authHeader ?? "";

  const encoder = new TextEncoder();
  const expectedBytes = encoder.encode(expected);
  const providedBytes = encoder.encode(provided);

  const match =
    expectedBytes.length === providedBytes.length &&
    crypto.subtle !== undefined
      ? await crypto.subtle
          .digest("SHA-256", expectedBytes)
          .then(async (a) => {
            const b = await crypto.subtle.digest("SHA-256", providedBytes);
            return (
              Buffer.from(a).toString("hex") === Buffer.from(b).toString("hex")
            );
          })
      : expected === provided;

  if (!match) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const expiredEvents = await prisma.event.findMany({
    where: {
      endTime: { lt: now },
      imagesDeleted: false,
    },
  });

  const results = [];

  for (const event of expiredEvents) {
    try {
      for (const imageUrl of event.images) {
        const imageId = imageUrl.split("/").pop();
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            },
          }
        );
      }

      await prisma.event.update({
        where: { id: event.id },
        data: {
          images: [],
          imagesDeleted: true,
        },
      });

      results.push({ id: event.id, status: "cleaned" });
    } catch (err) {
      console.error(`Failed to clean event ${event.id}:`, err);
      results.push({ id: event.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results });
}