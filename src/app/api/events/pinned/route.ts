import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const pinnedEvents = await prisma.event.findMany({
    where: { pinned: true },
    orderBy: { startTime: "asc" },
  });

  // 🔑 TRANSFORM HERE
  const formatted = pinnedEvents.map((event) => ({
    id: event.id,
    name: event.name,
    image: event.images[0] ?? null, // first image
    startTime: event.startTime,
    addressLine1: event.addressLine1,
    date: event.date,
  }));

  return NextResponse.json(formatted);
}
