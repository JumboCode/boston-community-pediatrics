import { prisma } from "@/lib/prisma";
import { getPublicURL } from "@/lib/r2";

export async function GET() {
  const pinnedEvents = await prisma.event.findMany({
    where: { pinned: true },
    take: 2,
    select: {
      id: true,
      name: true,
      images: true,
      startTime: true,
      endTime: true,
      addressLine1: true,
      date: true,
    },
  });

  const formatted = pinnedEvents.map((event) => ({
    ...event,
    image: getPublicURL(event.images[0]) ?? "/event-placeholder.jpg",
  }));

  return Response.json(formatted);
}
