import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 🔐 Admin-only enforcement
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { eventId } = await req.json();

  const pinnedCount = await prisma.event.count({
    where: { pinned: true },
  });

  if (pinnedCount >= 2) {
    return new NextResponse("Pin limit reached", { status: 400 });
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { pinned: true },
  });

  return NextResponse.json({ success: true });
}
