import Carousel from "@/components/common/Carousel";

import image6 from "@/assets/images/image6.jpg";
import image5 from "@/assets/images/image5.jpg";
import image4 from "@/assets/images/image4.jpg";
import image3 from "@/assets/images/image3.jpg";
import image2 from "@/assets/images/image2.jpg";
import image1 from "@/assets/images/image1.jpg";
import EventAdminTable from "@/components/common/tables/EventAdminTable";
import type { EventPosition } from "@prisma/client";
import { getEventById } from "@/app/api/events/controller";
import { getPositionsByEventId } from "@/app/api/eventPosition/controller";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import EventVolunteerTable from "@/components/common/tables/EventVolunteerTable";

export default async function EventDetailsPage(props: {
  params: { id: string };
}) {
  const { id: eventId } = await props.params;

  const hardCodedEvent = {
    name: "JumboCode Event",
    date: "October 12-14, 2025",
    location: "123 ABC Street, Boston MA 12345",
    description:
      "Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum etiam purus volutpat amet faucibus nibh nunc. Lacus quam pretium vitae dignissim. Nibh et tempus venenatis scelerisque enim egestas vestibulum tempor. Aliquam sit pretium tellus at molestie diam erat eget eget. Sagittis aliquam orci feugiat vitae. Sed a lectus porttitor mattis cursus viverra ut nisl mauris. Vitae faucibus ultrices volutpat fringilla in commodo. Massa augue malesuada consequat ac.",
    images: [image1, image2, image3, image4, image5, image6],
  };

  try {
    // Fetch event and positions in parallel
    const [event, positions] = await Promise.all([
      getEventById(eventId),
      getPositionsByEventId(eventId), // or fetch your API endpoint
    ]);
    const user = await getCurrentUser();

    if (!event) {
      return <p>Event does not exist</p>;
    }

    const imageUrls = (
  await Promise.all(
    (event.images ?? []).map(async (filename) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/images?filename=${encodeURIComponent(filename)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          console.error(`Failed to fetch image ${filename}: ${res.status}`);
          return null;
        }
        const data = await res.json();
        return data.url as string;
      } catch (error) {
        console.error(`Error fetching image ${filename}:`, error);
        return null;
      }
    })
  )
).filter(Boolean) as string[];

    return (
      <div className="flex flex-col justify-center items-center">
        <div className="pt-16 pb-12 flex flex-col items-center">
          {/* Carousel at the top */}
          <Carousel images={imageUrls.length > 0 ? imageUrls : hardCodedEvent.images} />

          {/* Event details */}
          <section className="max-w-[1000px] mt-[56px]">
            <h1 className="text-[#234254] text-[40px] leading-[44px]">
              {event.name ? event.name : "Event Name"}
            </h1>
            {/* Time / Date */}
            <p className="mt-[8px] text-[#234254] text-[28px] leading-[40px]">
              {(() => {
                const dates = event.date ?? [];
                if (dates.length === 0) return "Date unavailable";

                const start = new Date(dates[0]);
                if (isNaN(start.getTime())) return "Date unavailable";

                const end =
                  dates.length > 1 ? new Date(dates[dates.length - 1]) : start;

                const month = start.toLocaleString(undefined, { month: "long" });
                const year = start.getFullYear();

                if (start.toDateString() === end.toDateString()) {
                  return `${month} ${start.getDate()}, ${year}`;
                }

                return `${month} ${start.getDate()}-${end.getDate()}, ${year}`;
              })()}
            </p>

            {/* Address */}
            <p className="mt-[4px] text-[#234254] text-[20px] leading-[32px]">
              {[
                event.addressLine1,
                event.addressLine2,
                `${event.city} ${event.state} ${event.zipCode}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            <p className="mt-[32px] text-[#234254] text-[16px] leading-[24px]">
              {event.description}
            </p>
          </section>
        </div>

        <div
          className={`flex flex-col items-center justify-center ${
            user?.role !== UserRole.ADMIN
              ? "border border-gray-800 max-w-[1000px] m-10"
              : "space-y-6 p-3"
          }`}
        >
          {positions.map((item: EventPosition) => {
            // Format address
            const location = [
              item.addressLine1,
              item.addressLine2, // optional
              `${item.city} ${item.state} ${item.zipCode}`,
            ]
              .filter(Boolean) // remove empty strings
              .join(", ");

            if (user?.role == UserRole.ADMIN) {
              return (
                <EventAdminTable
                  key={item.id}
                  position={item.position}
                  startTime={item.startTime.toString()}
                  endTime={item.endTime.toString()}
                  description={item.description}
                  filledSlots={item.filledSlots}
                  totalSlots={item.totalSlots}
                  positionId={item.id}
                  location={location}
                  isAdmin={true}  // ← ADD THIS LINE!
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
                  filledSpots={item.filledSlots}
                  totalSpots={item.totalSlots}
                  positionId={item.id}
                  streetAddress={location}
                />
              );
            }
          })}
          {/* Bottom spacer */}
          <div></div>
        </div>
      </div>
    );
  } catch {
    console.error("Failed fetching event data");
    return <p>Failed to load event data.</p>;
  }
}