import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteObject, getObjectSize } from "@/lib/r2";
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
      let totalFreedBytes = 0;
      const remainingImages: string[] = [];

      for (const key of event.images) {
        try {
          const size = await getObjectSize(key);
          await deleteObject(key);
          // Only count bytes after confirmed deletion
          totalFreedBytes += size;
        } catch (err) {
          console.error(`Failed to delete image ${key} for event ${event.id}:`, err);
          remainingImages.push(key);
        }
      }

      // Update the DB to only remove successfully deleted images
      await prisma.event.update({
        where: { id: event.id },
        data: {
          images: remainingImages,
          imagesDeleted: remainingImages.length === 0,
        },
      });

      // Decrement storage counter only for confirmed deletions
      if (totalFreedBytes > 0) {
        await prisma.appConfig.upsert({
          where: { id: "singleton" },
          create: { id: "singleton", r2StorageBytes: BigInt(0) },
          update: { r2StorageBytes: { decrement: BigInt(totalFreedBytes) } },
        });
        await prisma.appConfig.updateMany({
          where: { id: "singleton", r2StorageBytes: { lt: 0 } },
          data: { r2StorageBytes: BigInt(0) },
        });
      }

      const status = remainingImages.length === 0 ? "cleaned" : "partial";
      results.push({ id: event.id, status });
    } catch (err) {
      console.error(`Failed to clean event ${event.id}:`, err);
      results.push({ id: event.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
