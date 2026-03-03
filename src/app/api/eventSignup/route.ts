import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Guest } from "@prisma/client";

const prisma = new PrismaClient();

import {
  getSignupsByEventId,
  getSignupsByUserId,
  getUsersByPositionId,
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
    if (userId) {
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
    // Changed because having only filledSlots wasn't updating correctly
    const actualSignups = await prisma.eventSignup.findMany({
      where: { positionId },
      select: { guests: { select: { id: true } } },
    });
    const actualFilledCount = actualSignups.reduce(
      (sum, s) => sum + 1 + s.guests.length,
      0
    );
    const availableSlots = position.totalSlots - actualFilledCount;

    if (availableSlots >= totalPeopleNeeded) {
      // Enough space - create normal signup with guests
      const newEventSignup = await prisma.eventSignup.create({
        data: {
          userId,
          positionId,
          eventId: position.eventId,
          hasGuests: guests.length > 0,
          guests: {
            create: guests.map((guest: Guest) => ({
              positionId,
              firstName: guest.firstName,
              lastName: guest.lastName,
              emailAddress: guest.emailAddress || null,
              phoneNumber: guest.phoneNumber || null,
              relation: guest.relation || null,
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
      const waitlistEntry = await prisma.eventWaitlist.create({
        data: {
          userId,
          positionId,
          isGuest: false,
          guests: {
            create: guests.map((guest: Guest) => ({
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.emailAddress || null,
              relation: guest.relation || null,
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
  } catch {
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

    let isAdmin = false;
    const user = await getCurrentUser();
    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if (user?.id != data.userId || !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    let isAdmin = false;
    const currentUser = await getCurrentUser();

    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (currentUser?.id != id && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
