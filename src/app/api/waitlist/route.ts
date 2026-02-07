import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const positionId = searchParams.get("positionId");

  console.log("🔍 Waitlist API called with positionId:", positionId);

  if (!positionId) {
    return NextResponse.json({ error: "Missing positionId" }, { status: 400 });
  }

  // Skip invalid positionIds like "0"
  if (positionId === "0") {
    console.log("⚠️ Invalid positionId: 0");
    return NextResponse.json([], { status: 200 });
  }

  try {
    const rows = await prisma.eventWaitlist.findMany({
      where: { positionId },
      include: { 
        user: true,
        guests: true, // Include waitlist guests
      },
    });

    console.log(`📊 Found ${rows.length} waitlist entries for position ${positionId}`);

    // Flatten the results to show main user + their guests
    const allEntries: any[] = [];

    for (const row of rows) {
      // Skip entries with null users
      if (!row.user || !row.userId) {
        console.log(`⚠️ Skipping waitlist entry ${row.id} - user is null`);
        continue;
      }

      // Add main user
      allEntries.push({
        waitlistId: row.id,
        userId: row.userId,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        emailAddress: row.user.emailAddress,
        phoneNumber: row.user.phoneNumber,
        isGuest: false,
      });

      // Add their guests
      for (const guest of row.guests) {
        allEntries.push({
          waitlistId: row.id, // Same waitlist ID as parent
          userId: guest.id, // Use guest ID as userId for unique identification
          firstName: guest.firstName,
          lastName: guest.lastName,
          emailAddress: guest.email || "",
          phoneNumber: "", // WaitlistGuest doesn't have phone
          guestOf: `${row.user.firstName} ${row.user.lastName}`,
          isGuest: true,
        });
      }
    }

    console.log(`✅ Returning ${allEntries.length} total entries (users + guests)`);

    return NextResponse.json(allEntries);
  } catch (error) {
    console.error("❌ Error fetching waitlist:", error);
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

    console.log("🗑️ Deleting waitlist entry:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Missing waitlist ID" },
        { status: 400 }
      );
    }

    // First, delete any associated guest records
    await prisma.waitlistGuest.deleteMany({
      where: { waitlistId: id },
    });

    // Then delete the waitlist entry
    await prisma.eventWaitlist.delete({
      where: { id },
    });

    console.log("✅ Waitlist entry deleted:", id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting waitlist entry:", error);
    return NextResponse.json(
      { error: "Failed to delete waitlist entry" },
      { status: 500 }
    );
  }
}