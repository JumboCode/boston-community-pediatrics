import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import { getEvents } from "@/app/api/events/controller";
import { Event, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import Button from "@/components/common/buttons/Button";

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

  const featuredEvents = events
    .filter((event) => event.pinned && event.date?.length > 0)
    .sort((a, b) => {
      const dateDiff =
        new Date(a.date[0]).getTime() - new Date(b.date[0]).getTime();

      if (dateDiff !== 0) return dateDiff;

      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  const regularEvents = events
    .filter((event) => !event.pinned && event.date?.length > 0)
    .sort((a, b) => {
      const dateDiff =
        new Date(a.date[0]).getTime() - new Date(b.date[0]).getTime();

      if (dateDiff !== 0) return dateDiff;

      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero */}
      <div className="w-full overflow-hidden">
        <Image
          src="/event-page-image-low.jpg"
          alt="Event Image"
          width={1920}
          height={600}
          className="w-full h-96 object-cover"
        />
      </div>

      <div className="w-full max-w-[1200px] px-6 py-12">
        <div className="flex">
          <h1 className="text-[16px] font-semibold mb-6 text-[#234254]">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            {" / "}
            <Link href="/event" className="hover:underline">
              Events
            </Link>
          </h1>
          {user?.role === UserRole.ADMIN && (
            <Link
              href="/event/createEvent"
              className="ml-auto rounded-lg bg-bcp-blue text-white mx-4 mt-1"
            >
              <Button label="Create New Event" />
            </Link>
          )}
        </div>
        {/* Featured Opportunities */}
        <h2 className="text-[32px] font-semibold mb-6 color: #234254">
          Featured Opportunities
        </h2>

        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {featuredEvents.map((event) => {
              const firstDate = event.date[0];
              return (
                <EventCard
                  key={event.id}
                  image="/event1.jpg"
                  title={event.name}
                  location={event.addressLine1}
                  date={firstDate}
                  startTime={event.startTime}
                  id={event.id}
                  pinned={event.pinned}
                  isAdmin={user?.role === UserRole.ADMIN}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 mb-12">
            There are no featured events at this time.
          </p>
        )}

        {/* All Opportunities */}
        <h2 className="text-[32px] font-semibold mb-6 color: #234254">
          Opportunities
        </h2>

        {regularEvents.length === 0 ? (
          <p className="text-gray-500">No events available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {regularEvents.map((event) => {
              const firstDate = event.date?.[0];
              return (
                <EventCard
                  key={event.id}
                  image="/event1.jpg"
                  title={event.name}
                  startTime={event.startTime}
                  location={event.addressLine1}
                  date={firstDate}
                  id={event.id}
                  pinned={event.pinned}
                  isAdmin={user?.role === UserRole.ADMIN}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

