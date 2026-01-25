import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Changed to Promise
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: eventId } = await params;  // Await params

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { pinned: true },
  });

  if (event?.pinned) {
    return new Response("Event is already pinned", { status: 400 });
  }

  const pinnedCount = await prisma.event.count({
    where: { pinned: true },
  });

  if (pinnedCount >= 2) {
    return new Response("Maximum 2 events can be pinned", { status: 400 });
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { pinned: true },
  });

  return Response.json({ success: true, pinned: true });
}