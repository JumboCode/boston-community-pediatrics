import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import { getEvents } from "@/app/api/events/controller";
import { Event } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import PinButton from "@/components/events/PinButton";
import Link from "next/link";

export default async function EventsPage() {
  const user = await getCurrentUser();

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
          <div className="flex gap-[24px] mt-12 ml-[60px] pr-[60px] w-max">
            {error ? (
              <p className="text-red-600 text-lg font-semibold">{error}</p>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-lg">No events available.</p>
            ) : (
              <>
                {events
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
                        isAdmin={user?.role === "ADMIN"}
                      ></EventCard>
                    );
                  })}

                {/* Add Event Card */}
                {user?.role === "ADMIN" && (
                  <Link href="/event/createEvent">
                    <div className="w-[283px] h-[318px] border-2 border-dashed border-gray-300 rounded-xl bg-white flex items-center justify-center cursor-pointer transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-[0.99]">
                      <div className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center">
                        <span className="text-2xl text-gray-500 leading-none">
                          +
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right gradient overlay */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </div>
  );
}
