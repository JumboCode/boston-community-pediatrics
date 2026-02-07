import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { positionId, waitlistIds } = (await req.json()) as {
      positionId: string;
      waitlistIds: string[];
    };

    console.log("🔄 Promoting from waitlist:", { positionId, waitlistIds });

    if (!positionId || !Array.isArray(waitlistIds) || waitlistIds.length === 0) {
      return NextResponse.json({ error: "Missing inputs" }, { status: 400 });
    }

    // Get the position so we know eventId and can check capacity
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

    // Get the waitlist entries
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

    console.log(`📊 Found ${waitlistRows.length} waitlist entries to promote`);

    // Check if there's room
    const availableSlots = position.totalSlots - position.filledSlots;
    
    console.log("📊 Capacity check:", {
      totalSlots: position.totalSlots,
      filledSlots: position.filledSlots,
      availableSlots,
      requestedToAdd: waitlistRows.length
    });
    
    if (availableSlots < waitlistRows.length) {
      const errorMsg = `Only ${availableSlots} spot(s) available, but trying to add ${waitlistRows.length} people`;
      console.error("❌ Not enough capacity:", errorMsg);
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    // Use a transaction to ensure all operations succeed or all fail
    await prisma.$transaction(async (tx) => {
      // For each waitlist entry, create signup AND move guests
      for (const waitlistRow of waitlistRows) {
        // Get the waitlist entry with guests
        const waitlistWithGuests = await tx.eventWaitlist.findUnique({
          where: { id: waitlistRow.id },
          include: { guests: true },
        });

        if (!waitlistWithGuests) continue;

        // Create event signup
        const signup = await tx.eventSignup.create({
          data: {
            eventId: position.eventId,
            positionId,
            userId: waitlistWithGuests.userId!,
            hasGuests: waitlistWithGuests.guests.length > 0,
          },
        });

        // Create guest records for the signup
        if (waitlistWithGuests.guests.length > 0) {
          await tx.guest.createMany({
            data: waitlistWithGuests.guests.map((g) => ({
              signupId: signup.id,
              positionId,
              firstName: g.firstName,
              lastName: g.lastName,
              emailAddress: g.email,
              relation: g.relation,
              phoneNumber: null, // WaitlistGuest doesn't have phone
            })),
          });
        }

        console.log(`✅ Created signup with ${waitlistWithGuests.guests.length} guests`);
      }

      // Delete waitlist guests first (to avoid foreign key constraint)
      await tx.waitlistGuest.deleteMany({
        where: {
          waitlistId: { in: waitlistIds },
        },
      });

      console.log("✅ Deleted waitlist guests");

      // Delete from waitlist
      await tx.eventWaitlist.deleteMany({
        where: {
          id: { in: waitlistIds },
          positionId,
        },
      });

      console.log("✅ Deleted from waitlist");

      // Calculate total people being promoted (users + their guests)
      const totalPeoplePromoted = waitlistRows.reduce((sum, row) => {
        const entry = waitlistRows.find((w) => w.id === row.id);
        // Count: 1 (user) + number of guests
        return sum + 1; // Will be updated to count guests properly
      }, 0);

      // Increment filled slots by total people
      await tx.eventPosition.update({
        where: { id: positionId },
        data: { filledSlots: { increment: waitlistRows.length } },
      });

      console.log(`✅ Incremented filled slots by ${waitlistRows.length}`);
    });

    console.log(`🎉 Successfully promoted ${waitlistRows.length} users`);

    return NextResponse.json({
      ok: true,
      promoted: waitlistRows.length,
      message: `Successfully promoted ${waitlistRows.length} user(s) from waitlist`,
    });
  } catch (error) {
    console.error("❌ Error promoting waitlist users:", error);
    return NextResponse.json(
      { error: "Failed to promote waitlist users" },
      { status: 500 }
    );
  }
}