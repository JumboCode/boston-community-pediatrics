import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed to Promise
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: eventId } = await params; // Await params

  await prisma.event.update({
    where: { id: eventId },
    data: { pinned: false },
  });

  return Response.json({ success: true, pinned: false });
}
