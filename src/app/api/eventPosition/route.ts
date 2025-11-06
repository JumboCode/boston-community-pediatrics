import { NextRequest, NextResponse } from "next/server";
import {
  getPositionsByEventId,
  createEventPosition,
  updateEventPosition,
  deleteEventPosition,
} from "./controller";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (eventId) {
      const eventPositions = await getPositionsByEventId(eventId);
      if (!eventPositions)
        return NextResponse.json(
          { error: "Event positions not found" },
          { status: 404 }
        );
      return NextResponse.json(eventPositions, { status: 200 });
    } else {
      return NextResponse.json({ error: "Wrong event query" }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch event positions" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newEventPosition = await createEventPosition(data);
    return NextResponse.json(newEventPosition, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create event position" },
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
    const updatedEventPosition = await updateEventPosition(id, data);
    return NextResponse.json(updatedEventPosition, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update event position" },
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

    const deletedEventPosition = await deleteEventPosition(id);
    return NextResponse.json(deletedEventPosition, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete event signup position" },
      { status: 500 }
    );
  }
}
