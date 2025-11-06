import { NextRequest, NextResponse } from 'next/server';
import { getPositionsByEventId, createEventPosition } from './controller';

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (eventId) {
      const event = await getPositionsByEventId(eventId);
      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      return NextResponse.json(event, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Wrong event query' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newEvent = await createEventPosition(data);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}