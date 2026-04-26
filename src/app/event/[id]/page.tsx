import Carousel from "@/components/common/Carousel";
import rectangleGray from "@/assets/images/rectangle-event.jpg";
import EventAdminTable from "@/components/common/tables/EventAdminTable";
import type { EventPosition } from "@prisma/client";
import { getEventById } from "@/app/api/events/controller";
import { getPositionsByEventId } from "@/app/api/eventPosition/controller";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import EventVolunteerTable from "@/components/common/tables/EventVolunteerTable";
import { getPublicURL } from "@/lib/r2";
import Link from "next/link";
import Image from "next/image";
import arrowLeft from "@/assets/icons/arrow-left.svg";
import EventNotFoundModal from "@/components/common/EventNotFoundModal";

export default async function EventDetailsPage(props: {
  params: { id: string };
}) {
  const { id: eventId } = await props.params;

  try {
    const [event, positions] = await Promise.all([
      getEventById(eventId),
      getPositionsByEventId(eventId),
    ]);

    const user = await getCurrentUser();

    if (!event) {
      return <EventNotFoundModal />;
    }

    const isExpired = new Date(event.endTime) < new Date();
    const imageUrls = (event.images ?? [])
      .map((filename) => getPublicURL(filename))
      .filter((url) => url.trim() !== "") as string[];

    return (
      <div className="relative">
        <Link
          href="/event"
          className="absolute top-6 left-4 sm:top-10 sm:left-12"
        >
          <Image src={arrowLeft} alt="Back to events" className="w-8 h-8" />
        </Link>
        <div className="flex flex-col justify-center items-center">
          <div className="pt-16 pb-12 flex flex-col items-center w-full">
            {/* Carousel at the top */}
            <Carousel
              images={imageUrls.length > 0 ? imageUrls : [rectangleGray]}
            />

            {/* Event details */}
            <section className="w-full max-w-[1000px] mt-[56px] px-4 sm:px-6">
              <h1 className="text-bcp-blue text-[28px] sm:text-[40px] leading-tight">
                {event.name ? event.name : "Event Name"}
              </h1>
              {/* Date */}
              <p className="mt-[8px] text-bcp-blue text-[20px] sm:text-[28px] leading-[40px]">
                {(() => {
                  if (!event.startTime) return "Date unavailable";

                  const start = new Date(event.startTime);
                  const end = new Date(event.endTime);

                  if (isNaN(start.getTime())) return "Date unavailable";

                  const tz = "America/New_York";

                  if (start.toDateString() === end.toDateString()) {
                    return start.toLocaleDateString("en-US", {
                      timeZone: tz,
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }

                  const startStr = start.toLocaleDateString("en-US", {
                    timeZone: tz,
                    month: "long",
                    day: "numeric",
                  });
                  const endStr = end.toLocaleDateString("en-US", {
                    timeZone: tz,
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

                  return `${startStr} – ${endStr}`;
                })()}
              </p>
              {/* Time */}
              <p className="mt-[4px] text-bcp-blue text-[20px] sm:text-[28px] leading-[40px]">
                {event.startTime && event.endTime
                  ? `${new Date(event.startTime).toLocaleTimeString("en-US", {
                      timeZone: "America/New_York",
                      hour: "numeric",
                      minute: "2-digit",
                    })} – ${new Date(event.endTime).toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "America/New_York",
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}`
                  : "Time unavailable"}
              </p>
              {/* Address */}
              <p className="mt-[4px] text-bcp-blue text-[16px] sm:text-[20px] leading-[32px]">
                {[
                  event.addressLine1,
                  event.addressLine2,
                  `${event.city} ${event.state} ${event.zipCode}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="mt-[32px] text-bcp-blue text-[16px] leading-[24px]">
                {event.description}
              </p>
              {event.resourcesLink && (
                <div className="mt-[16px]">
                  <a
                    href={event.resourcesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bcp-blue text-[16px] leading-[24px] underline hover:text-blue-700"
                  >
                    Link to resources
                  </a>
                </div>
              )}
              {isExpired && (
                <p className="mt-6 text-gray-500 italic">
                  This event has already taken place and is no longer accepting
                  sign-ups.
                </p>
              )}
            </section>
          </div>

          <div
            className={`w-full flex flex-col items-center justify-center ${
              user?.role !== UserRole.ADMIN
                ? "border border-gray-800 max-w-[1000px] m-10"
                : "space-y-6 p-3"
            }`}
          >
            {positions.map((item: EventPosition) => {
              const location = [
                item.addressLine1,
                item.addressLine2,
                `${item.city} ${item.state} ${item.zipCode}`,
              ]
                .filter(Boolean)
                .join(", ");

              if (user?.role === UserRole.ADMIN) {
                return (
                  <EventAdminTable
                    key={item.id}
                    position={item.position}
                    startTime={item.startTime.toString()}
                    endTime={item.endTime.toString()}
                    description={item.description}
                    totalSlots={item.totalSlots}
                    positionId={item.id}
                    location={location}
                    isAdmin={true}
                  />
                );
              } else {
                return (
                  <EventVolunteerTable
                    key={item.id}
                    positionTitle={item.position}
                    startTime={item.startTime.toString()}
                    endTime={item.endTime.toString()}
                    description={item.description}
                    totalSpots={item.totalSlots}
                    positionId={item.id}
                    streetAddress={location}
                  />
                );
              }
            })}
            <div></div>
          </div>
        </div>
      </div>
    );
  } catch {
    console.error("Failed fetching event data");
    return <p>Failed to load event data.</p>;
  }
}
