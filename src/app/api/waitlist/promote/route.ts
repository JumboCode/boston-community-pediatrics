import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { positionId, waitlistIds } = (await req.json()) as {
      positionId: string;
      waitlistIds: string[];
    };

    if (!positionId || !Array.isArray(waitlistIds) || waitlistIds.length === 0) {
      return NextResponse.json({ error: "Missing inputs" }, { status: 400 });
    }

    const position = await prisma.eventPosition.findUnique({
      where: { id: positionId },
      select: {
        eventId: true,
        filledSlots: true,
        totalSlots: true,
      },
    });

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    const waitlistRows = await prisma.eventWaitlist.findMany({
      where: {
        id: { in: waitlistIds },
        positionId,
      },
    });

    if (waitlistRows.length === 0) {
      return NextResponse.json(
        { error: "No waitlist entries found" },
        { status: 404 }
      );
    }

    const availableSlots = position.totalSlots - position.filledSlots;

    if (availableSlots < waitlistRows.length) {
      const errorMsg = `Only ${availableSlots} spot(s) available, but trying to add ${waitlistRows.length} people`;
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const waitlistRow of waitlistRows) {
        const waitlistWithGuests = await tx.eventWaitlist.findUnique({
          where: { id: waitlistRow.id },
          include: { guests: true },
        });

        if (!waitlistWithGuests) continue;

        const signup = await tx.eventSignup.create({
          data: {
            eventId: position.eventId,
            positionId,
            userId: waitlistWithGuests.userId!,
            hasGuests: waitlistWithGuests.guests.length > 0,
          },
        });

        if (waitlistWithGuests.guests.length > 0) {
          await tx.guest.createMany({
            data: waitlistWithGuests.guests.map((g) => ({
              signupId: signup.id,
              positionId,
              firstName: g.firstName,
              lastName: g.lastName,
              emailAddress: g.email,
              relation: g.relation,
              phoneNumber: null,
            })),
          });
        }
      }

      await tx.waitlistGuest.deleteMany({
        where: {
          waitlistId: { in: waitlistIds },
        },
      });

      await tx.eventWaitlist.deleteMany({
        where: {
          id: { in: waitlistIds },
          positionId,
        },
      });

      await tx.eventPosition.update({
        where: { id: positionId },
        data: { filledSlots: { increment: waitlistRows.length } },
      });
    });

    return NextResponse.json({
      ok: true,
      promoted: waitlistRows.length,
      message: `Successfully promoted ${waitlistRows.length} user(s) from waitlist`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to promote waitlist users" },
      { status: 500 }
    );
  }
}