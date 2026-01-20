import { NextRequest, NextResponse } from "next/server";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./controller";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";
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
    const start = combineDateTime(data.date, data.time);

    const prismaData = {
      name: data.title,
      description: data.description || undefined,
      resourcesLink: data.resourcesLink || undefined,

      // REQUIRED by your Prisma type (based on the error)
      startTime: start,
      endTime: start,

      // // ALSO required by your Prisma type (based on the error)
      // // Make it whatever your app considers the "full address"
      // address: [
      //   data.address,
      //   data.apt ? `Apt ${data.apt}` : null,
      //   `${data.city}, ${data.state} ${data.zip}`,
      // ]
      //   .filter(Boolean)
      //   .join(", "),

      addressLine1: data.address,
      addressLine2: data.apt || null,
      city: data.city,
      state: data.state,
      zipCode: data.zip,

      date: [new Date(data.date)],

      positions: {
        create: data.positions.map((p) => {
          const date = p.sameAsDate ? data.date : p.date;
          const time = p.sameAsTime ? data.time : p.time;
          const start = combineDateTime(date, time);

          const line1 = p.sameAsAddress ? data.address : p.address;
          const line2 = (p.sameAsAddress ? data.apt : p.apt) || null;
          const city = p.sameAsAddress ? data.city : p.city;
          const state = p.sameAsAddress ? data.state : p.state;
          const zip = p.sameAsAddress ? data.zip : p.zip;

          return {
            position: p.name,
            description: p.description || "",
            date: new Date(date),
            startTime: start,
            endTime: start,
            totalSlots: Number(p.participants || 0),
            filledSlots: 0,

            // // if your Position model ALSO has "address" required,
            // // add it the same way as Event above:
            // address: [
            //   line1,
            //   line2 ? `Apt ${line2}` : null,
            //   `${city}, ${state} ${zip}`,
            // ]
            //   .filter(Boolean)
            //   .join(", "),

            addressLine1: line1,
            addressLine2: line2,
            city,
            state,
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
