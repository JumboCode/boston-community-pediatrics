import { prisma } from "@/lib/prisma";

export async function GET() {
  const pinnedEvents = await prisma.event.findMany({
    where: { pinned: true },
    take: 2,
    select: {
      id: true,
      name: true,
      images: true,
      startTime: true,
      addressLine1: true,
      date: true,
    },
  });

  // Normalize image field for frontend
  const formatted = pinnedEvents.map((event) => ({
    ...event,
    image: event.images[0] ?? "/event-placeholder.jpg",
  }));

  return Response.json(formatted);
}
