import { NextRequest, NextResponse } from "next/server";
import {
  getSignupsByEventId,
  createEventSignup,
  updateEventSignup,
  deleteEventSignup,
} from "./controller";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (eventId) {
      const event = await getSignupsByEventId(eventId);
      if (!event)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      return NextResponse.json(event, { status: 200 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newEvent = await createEventSignup(data);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(req: NextRequest) {
  try {
    const { id, data } = await req.json();
    const updatedEvent = await updateEventSignup(id, data);
    return NextResponse.json(updatedEvent, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const id = await req.json();
    const deletedEvent = await deleteEventSignup(id);
    return NextResponse.json(deletedEvent, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
