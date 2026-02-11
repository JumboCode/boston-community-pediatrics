import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const positionId = searchParams.get("positionId");

  if (!positionId) {
    return NextResponse.json({ error: "Missing positionId" }, { status: 400 });
  }

  if (positionId === "0") {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const rows = await prisma.eventWaitlist.findMany({
      where: { positionId },
      include: {
        user: true,
        guests: true,
      },
    });

    const allEntries: any[] = [];

    for (const row of rows) {
      if (!row.user || !row.userId) {
        continue;
      }

      allEntries.push({
        waitlistId: row.id,
        userId: row.userId,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        emailAddress: row.user.emailAddress,
        phoneNumber: row.user.phoneNumber,
        isGuest: false,
      });

      for (const guest of row.guests) {
        allEntries.push({
          waitlistId: row.id,
          userId: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          emailAddress: guest.email || "",
          phoneNumber: "",
          guestOf: `${row.user.firstName} ${row.user.lastName}`,
          isGuest: true,
        });
      }
    }

    return NextResponse.json(allEntries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing waitlist ID" },
        { status: 400 }
      );
    }

    await prisma.waitlistGuest.deleteMany({
      where: { waitlistId: id },
    });

    await prisma.eventWaitlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete waitlist entry" },
      { status: 500 }
    );
  }
}