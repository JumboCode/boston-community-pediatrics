import { NextRequest, NextResponse } from "next/server";
import {
  getSignupsByEventId,
  getUsersByPositionId,
  createEventSignup,
  updateEventSignup,
  deleteEventSignup,
} from "./controller";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const positionId = searchParams.get("positionId");
    console.log("goint into getUsersByPositionID get REQ");

    if (positionId) {
      console.log("goint into getUsersByPositionID");
      const users = await getUsersByPositionId(positionId);
      if (!users)
        return NextResponse.json(
          { error: "Event signups not found" },
          { status: 404 }
        );
      return NextResponse.json(users, { status: 200 });
    } else if (eventId) {
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
    const newEventSignup = await createEventSignup(data);
    return NextResponse.json(newEventSignup, { status: 201 });
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
    return NextResponse.json(deletedEventSignup, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete event signup" },
      { status: 500 }
    );
  }
}
