import { NextRequest, NextResponse } from "next/server";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./controller";
import { PrismaClient, UserRole } from "@prisma/client";
import { eventSchema } from "@/lib/schemas/eventSchema";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const event = await getEventById(id);
      if (!event)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      return NextResponse.json(event, { status: 200 });
    } else {
      const events = await getEvents();
      return NextResponse.json(events, { status: 200 });
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
    const json = await req.json();

    const user = await getCurrentUser();

    let isAdmin = false;
    if (user) {
      if (user.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // const parse = eventSchema.safeParse(json);

    // if (!parse.success) {
    //   return NextResponse.json(
    //     { error: "Failed to parse event data" },
    //     { status: 400 }
    //   );
    // }

    // const data = parse.data;

    // const prismaData = {
    //   name: data.name,
    //   description: data.description || undefined,
    //   resourcesLink: data.resourcesLink || undefined,

    //   addressLine1: data.address,
    //   addressLine2: data.apt || null,
    //   city: data.city,
    //   state: data.state,
    //   zipCode: data.zip,

    //   date: new Date(data.date),
    //   time: combineDateTime(data.date, data.time),

    //   positions: {
    //     create: data.positions.map((p) => {
    //       const date = p.date || data.date;
    //       const time = p.time || data.time;
    //       const start = combineDateTime(date, time);

    //       return {
    //         position: p.name,
    //         description: p.description || "",
    //         date: new Date(date),
    //         startTime: start,
    //         endTime: start,
    //         totalSlots: Number(p.participants || 0),
    //         filledSlots: 0,
    //         addressLine1: p.address || data.address,
    //         addressLine2: p.apt || data.apt || null,
    //         city: p.city || data.city,
    //         state: p.state || data.state,
    //         zipCode: p.zip || data.zip,
    //       };
    //     }),
    //   },
    // };

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

    const data = await req.json(); // body data
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
