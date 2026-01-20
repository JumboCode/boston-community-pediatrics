import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import { getEvents } from "@/app/api/events/controller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Event } from "@prisma/client";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  let events: Event[] = [];
  let error: string | null = null;
  try {
    events = await getEvents();
  } catch {
    console.error("Failed to load events");
    error = "Failed to load events";
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full overflow-hidden">
        <Image
          src="/event-page-image-low.jpg"
          alt="Event Image"
          width={1920}
          height={600}
          className="w-full h-96 object-cover"
        />
      </div>

      {/* Events Section */}
      <div className="relative w-full">
        {/* Scrollable container */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-12 mt-12 p-4 w-max mx-auto">
            {error ? (
              <p className="text-red-600 text-lg font-semibold">{error}</p>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-lg">No events available.</p>
            ) : (
              events
                .filter((event) => event.date && event.date.length > 0)
                .map((event) => {
                  const firstDate = event.date[0];
                  return (
                    <EventCard
                      key={event.id}
                      image="/event1.jpg"
                      title={event.name}
                      time={event.startTime}
                      location={event.addressLine1}
                      date={firstDate}
                      id={event.id}
                      pinned={event.pinned}
                      isAdmin={isAdmin}
                    />
                  );
                })
            )}
          </div>
        </div>

        {/* Right gradient overlay */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </div>
  );
}
