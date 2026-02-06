import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { positionId, signupIds } = (await req.json()) as {
    positionId: string;
    signupIds: string[];
  };

  if (!positionId || !Array.isArray(signupIds) || signupIds.length === 0) {
    return NextResponse.json(
      { error: "Missing inputs" },
      { status: 400 }
    );
  }

  // Get waitlist rows
  const waitlistRows = await prisma.eventWaitlist.findMany({
    where: {
      id: { in: signupIds },
      positionId,
    },
  });

  // Create event signups for those users
  await prisma.eventSignup.createMany({
    data: waitlistRows.map((row) => ({
      positionId,
      userId: row.userId,
    })),
    skipDuplicates: true,
  });

  // Remove from waitlist
  await prisma.eventWaitlist.deleteMany({
    where: {
      id: { in: signupIds },
      positionId,
    },
  });

  return NextResponse.json({
    ok: true,
    promoted: waitlistRows.length,
  });
}
