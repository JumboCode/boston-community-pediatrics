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
  getAllSignups,
} from "./controller";

import { decrementEventPositionCount } from "../eventPosition/controller";
import { UserRole } from "@prisma/client";
import {
  getCurrentUser,
  requireAdmin,
  requireSelfOrAdmin,
  requireOwnerOrAdmin,
  route,
} from "@/lib/auth";

// GET handler
export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const positionId = searchParams.get("positionId");
  const userId = searchParams.get("userId");

  const user = await getCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Signup history should only be visible to the owner or an admin.
  if (userId) {
    await requireSelfOrAdmin(userId);
    const signups = await getSignupsByUserId(userId);
    return NextResponse.json(signups, { status: 200 });
  }

  // Position roster stays as-is: admins get full details, non-admins get
  // the public-safe shape from getUsersByPositionId(..., false).
  if (positionId) {
    const users = await getUsersByPositionId(positionId, isAdmin);
    if (!users) {
      return NextResponse.json(
        { error: "Event signups not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(users, { status: 200 });
  }

  if (eventId) {
    await requireAdmin();
    const eventSignups = await getSignupsByEventId(eventId);
    if (!eventSignups) {
      return NextResponse.json(
        { error: "Event signups not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(eventSignups, { status: 200 });
  }

  // No filters means all signups; admin only.
  await requireAdmin();
  const all = await getAllSignups();
  return NextResponse.json(all, { status: 200 });
});

// POST handler
// Updated POST handler with guest support
export const POST = route(async (req: NextRequest) => {
  const data = await req.json();
  const { positionId, userId, comments, guests = [] } = data;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  // Caller must be signing themselves up, or be an admin signing up someone else.
  await requireSelfOrAdmin(userId);

  // Validate guest phone numbers
  for (const guest of guests) {
    if (guest.phoneNumber && !/^[0-9]*$/.test(guest.phoneNumber)) {
      return NextResponse.json(
        { error: "Guest phone number must contain only numbers" },
        { status: 400 }
      );
    }
  }

  // Get position and count current signups
  const [position] = await Promise.all([
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
        comments: comments || null,
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
            speaksSpanish: guest.speaksSpanish || false,
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
            speaksSpanish: guest.speaksSpanish || false,
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
});

// PUT handler
export const PUT = route(async (req: NextRequest) => {
  // Admin-only endpoint
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const data = await req.json();

  // Validate guest phone numbers if guests are being updated
  if (data.guests) {
    for (const guest of data.guests) {
      if (guest.phoneNumber && !/^[0-9]*$/.test(guest.phoneNumber)) {
        return NextResponse.json(
          { error: "Guest phone number must contain only numbers" },
          { status: 400 }
        );
      }
    }
  }

  const updatedEventSignup = await updateEventSignup(id, data);
  return NextResponse.json(updatedEventSignup, { status: 201 });
});

// DELETE handler
export const DELETE = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { resource: signup } = await requireOwnerOrAdmin(() =>
    prisma.eventSignup.findUnique({ where: { id } })
  );

  const deletedEventSignup = await deleteEventSignup(signup.id);

  // Decrement numSignups after removing signup and guests
  await decrementEventPositionCount(deletedEventSignup.positionId);
  return NextResponse.json(deletedEventSignup, { status: 201 });
});
