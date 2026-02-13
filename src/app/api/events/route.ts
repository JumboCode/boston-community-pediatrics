// src/app/api/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./controller";
import { Prisma, UserRole } from "@prisma/client";
import { eventSchema } from "@/lib/schemas/eventSchema";
import { getCurrentUser } from "@/lib/auth";

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function toMidnight(date: string) {
  return new Date(`${date}T00:00:00`);
}


// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const event = await getEventById(id);
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json(event, { status: 200 });
    }

    const events = await getEvents();
    return NextResponse.json(events, { status: 200 });
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
    const json = await req.json();

    const user = await getCurrentUser();
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parse = eventSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Failed to parse event data", issues: parse.error.issues },
        { status: 400 }
      );
    }

    const data = parse.data;

    // Event-level start/end
    const eventStart = combineDateTime(data.date, data.startTime);
    const eventEnd = combineDateTime(data.date, data.endTime);

    const prismaData = {
      name: data.title,
      description: data.description || "",

      startTime: eventStart,
      endTime: eventEnd,

      addressLine1: data.address,
      addressLine2: data.apt || null,
      city: data.city,
      state: data.state,
      country: "USA",
      zipCode: data.zip,

      // your Prisma schema uses DateTime[]
      date: [toMidnight(data.date)],

      positions: {
        create: data.positions.map((p) => {
          const posDate = p.sameAsDate ? data.date : p.date;

          const posStartT = p.sameAsTime ? data.startTime : p.startTime;
          const posEndT = p.sameAsTime ? data.endTime : p.endTime;

          const posStart = combineDateTime(posDate, posStartT);
          const posEnd = combineDateTime(posDate, posEndT);

          const line1 = p.sameAsAddress ? data.address : p.address;
          const line2 = (p.sameAsAddress ? data.apt : p.apt) || null;
          const city = p.sameAsAddress ? data.city : p.city;
          const state = p.sameAsAddress ? data.state : p.state;
          const zip = p.sameAsAddress ? data.zip : p.zip;

          return {
            position: p.name,
            description: p.description || "",
            date: toMidnight(posDate),
            startTime: posStart,
            endTime: posEnd,
            totalSlots: Number(p.participants || 0),
            filledSlots: 0,

            addressLine1: line1,
            addressLine2: line2,
            city,
            state,
            country: "USA",
            zipCode: zip,
          };
        }),
      },
    } satisfies Prisma.EventCreateInput;

    const newEvent = await createEvent(prismaData);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await req.json();
    const updated = await updateEvent(id, data);

    return NextResponse.json(updated, { status: 200 });
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteEvent(id);
    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

