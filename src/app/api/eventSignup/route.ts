import { NextRequest, NextResponse } from "next/server";
import { createWaitlistSignup } from "./controller";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



import {
  getSignupsByEventId,
  getSignupsByUserId,
  getUsersByPositionId,
  createEventSignup,
  updateEventSignup,
  deleteEventSignup,
} from "./controller";

import { decrementEventPositionCount } from "../eventPosition/controller";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const positionId = searchParams.get("positionId");
    const userId = searchParams.get("userId");

    let isAdmin = false;
    const user = await getCurrentUser();

    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if(userId){
      const signups = await getSignupsByUserId(userId);
      return NextResponse.json(signups);
    }
    if (positionId) {
      const users = await getUsersByPositionId(positionId, isAdmin);
      if (!users)
        return NextResponse.json(
          { error: "Event signups not found" },
          { status: 404 }
        );
      return NextResponse.json(users, { status: 200 });
    } else if (eventId) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const eventSignups = await getSignupsByEventId(eventId);
      if (!eventSignups)
        return NextResponse.json(
          { error: "Event signups not found" },
          { status: 404 }
        );
      return NextResponse.json(eventSignups, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Missing event or position Id" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch event signups" },
      { status: 500 }
    );
  }
}

// POST handler
// Updated POST handler with guest support
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { positionId, userId, guests = [] } = data;

    console.log("📝 Registration with guests:", { positionId, userId, guestCount: guests.length });

    // Get position and count current signups
    const [position, signupCount] = await Promise.all([
      prisma.eventPosition.findUnique({
        where: { id: positionId },
      }),
      prisma.eventSignup.count({
        where: { positionId },
      }),
    ]);

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // Calculate total people needed (user + guests)
    const totalPeopleNeeded = 1 + guests.length;

    // Check if there's enough space for user + all guests
    const availableSlots = position.totalSlots - signupCount;

    if (availableSlots >= totalPeopleNeeded) {
      // ✅ Enough space - create normal signup with guests
      console.log(`✅ Creating signup with ${guests.length} guests`);

      const newEventSignup = await prisma.eventSignup.create({
        data: {
          userId,
          positionId,
          eventId: position.eventId,
          hasGuests: guests.length > 0,
          guests: {
            create: guests.map((guest: any) => ({
              positionId,
              firstName: guest.firstName,
              lastName: guest.lastName,
              emailAddress: guest.email || null,
              phoneNumber: guest.phoneNumber || null,
              relation: guest.relationship || null,
            })),
          },
        },
        include: {
          guests: true,
        },
      });

      // Increment filled slots by total people (user + guests)
      await prisma.eventPosition.update({
        where: { id: positionId },
        data: {
          filledSlots: {
            increment: totalPeopleNeeded,
          },
        },
      });

      return NextResponse.json(newEventSignup, { status: 201 });
    } else {
      // ❌ Not enough space - add to waitlist with guests
      console.log(`⏳ Adding to waitlist with ${guests.length} guests`);

      const waitlistEntry = await prisma.eventWaitlist.create({
        data: {
          userId,
          positionId,
          isGuest: false,
          guests: {
            create: guests.map((guest: any) => ({
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email || null,
              relation: guest.relationship || null,
            })),
          },
        },
        include: {
          guests: true,
        },
      });

      return NextResponse.json(
        {
          waitlisted: true,
          waitlistEntry,
          eventId: position.eventId,
          positionId: positionId,
        },
        { status: 201 }
      );
    }
  } catch (err) {
    console.error("❌ Error in POST:", err);
    return NextResponse.json(
      { error: "Failed to create event signup" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const data = await req.json();
    const updatedEventSignup = await updateEventSignup(id, data);
    return NextResponse.json(updatedEventSignup, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update event signup" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedEventSignup = await deleteEventSignup(id);

    // 3. Decrement numSignups
    await decrementEventPositionCount(deletedEventSignup.positionId);
    return NextResponse.json(deletedEventSignup, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete event signup" },
      { status: 500 }
    );
  }
}
