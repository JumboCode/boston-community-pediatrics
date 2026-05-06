import { NextRequest, NextResponse } from "next/server";
import {
  getPositionsByEventId,
  createEventPosition,
  updateEventPosition,
  deleteEventPosition,
  getPositionById,
  getAllPositions,
} from "./controller";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getPublicURL } from "@/lib/r2";

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function assertSingleDay(payload: { startTime?: unknown; endTime?: unknown }) {
  if (!payload?.startTime || !payload?.endTime) return null;
  const start = new Date(payload.startTime as string | number | Date);
  const end = new Date(payload.endTime as string | number | Date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (!isSameLocalDay(start, end)) {
    return "Positions cannot span multiple days";
  }
  return null;
}

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

      // Resolve event image keys to full public URLs server-side
      if (position.event?.images) {
        (position.event as { images: string[] }).images = position.event.images.map((key) =>
          key.startsWith("http") ? key : getPublicURL(key)
        );
      }

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
      const user = await getCurrentUser();
      if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const all = await getAllPositions();
      return NextResponse.json(all, { status: 200 });
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
    let isAdmin = false;
    const user = await getCurrentUser();

    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spanError = assertSingleDay(data);
    if (spanError) {
      return NextResponse.json({ error: spanError }, { status: 400 });
    }

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
    let isAdmin = false;
    const user = await getCurrentUser();

    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    const spanError = assertSingleDay(data);
    if (spanError) {
      return NextResponse.json({ error: spanError }, { status: 400 });
    }

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
    let isAdmin = false;
    const user = await getCurrentUser();

    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
