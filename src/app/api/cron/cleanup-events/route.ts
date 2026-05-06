import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/r2";
import crypto from "crypto";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const provided = authHeader ?? "";

  const encoder = new TextEncoder();
  const [a, b] = [encoder.encode(expected), encoder.encode(provided)];
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", a),
    crypto.subtle.digest("SHA-256", b),
  ]);
  const match =
    a.length === b.length &&
    Buffer.from(hashA).toString("hex") === Buffer.from(hashB).toString("hex");

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

  const results: { id: string; status: string }[] = [];

  for (const event of expiredEvents) {
    try {
      await Promise.all(event.images.map((key) => deleteObject(key)));

      await prisma.event.update({
        where: { id: event.id },
        data: { images: [], imagesDeleted: true },
      });

      results.push({ id: event.id, status: "cleaned" });
    } catch (err) {
      console.error(`Failed to clean event ${event.id}:`, err);
      results.push({ id: event.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
