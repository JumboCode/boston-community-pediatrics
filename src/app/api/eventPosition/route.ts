import { NextRequest, NextResponse } from "next/server";
import {
  getPositionsByEventId,
  createEventPosition,
  updateEventPosition,
  deleteEventPosition,
  getPositionById,
} from "./controller";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // This is the specific Position ID
    const eventId = searchParams.get("eventId");

    // CASE 1: Fetch Single Position by ID
    if (id) {
      const position = await getPositionById(id);
      
      if (!position) {
        return NextResponse.json(
          { error: "Position not found" },
          { status: 404 }
        );
      }
      // Returns a single object, e.g. { position: "Gate", description: "..." }
      return NextResponse.json(position, { status: 200 });
    }
    
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
