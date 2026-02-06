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
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { positionId, userId } = data;

    // count current signups
    const signupCount = await prisma.eventSignup.count({
      where: { positionId },
    });

    // get position capacity
    const position = await prisma.eventPosition.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // if space available → normal signup
    if (signupCount < position.totalSlots) {
      const newEventSignup = await createEventSignup(data);
      return NextResponse.json(newEventSignup, { status: 201 });
    }

    // otherwise → WAITLIST
    const waitlistEntry = await createWaitlistSignup(positionId, userId);
    return NextResponse.json(
      { waitlisted: true, waitlistEntry },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
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
