"use client";

import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import { Event } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface EventSignupWithEvent {
  id: string;
  userId: string;
  eventId: string;
  positionId: string;
  hoursVolunteered?: number;
  event: Event;
  position?: {
    id: string;
    name: string;
  };
}

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();

  //const[userSignups, setUserSignUps] = useState<EventSignupWithEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("—");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const fetchedEvents = await response.json();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    async function fetchPhoneNumber() {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users?id=${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          console.log("User data from API:", userData);
          setPhoneNumber(userData.phoneNumber ?? "—");
        }
      } catch (err) {
        console.error("Failed to load phone number:", err);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchPhoneNumber();
    }
  }, [user?.id, isLoaded, isSignedIn]);

  useEffect(() => {
    console.log("Clerk user object:", user);
  }, [user]);

  if (!isLoaded || loading) {
    return <main className="min-h-screen p-8" />;
  }

  const firstName = isSignedIn ? user?.firstName ?? "" : "Guest";
  const lastName = isSignedIn ? user?.lastName ?? "" : "";
  const emailAddress = isSignedIn
    ? user?.primaryEmailAddress?.emailAddress ?? "—"
    : "—";
  const memberSince =
    isSignedIn && user?.createdAt
      ? new Date(user.createdAt).getFullYear()
      : "0000";

  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.date && event.date.length > 0)
    .filter((event) => new Date(event.date[0]) >= now)
    .slice(0, 2);

  return (
    <main className="min-h-screen p-8">
      {/* UPCOMING EVENTS */}
      <div className="mt-[142px] ml-[120px] flex items-center gap-3">
        <div className="h-[36.19] w-[283px] text-[28px] font-bold">
          Uupcoming Events
        </div>
      </div>

      <div className="mt-[54px] ml-[120px] flex flex-wrap gap-[25px]">
        {error ? (
          <p className="text-lg font-semibold text-red-600">{error}</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-lg text-gray-500">No upcoming events.</p>
        ) : (
          upcomingEvents.map((event) => {
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
              />
            );
          })
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="absolute top-[248px] right-[121px] h-[420px] w-[305px] rounded-lg bg-[#426982]">
        <div className="absolute top-[30px] left-1/2 h-[105px] w-[105px] -translate-x-1/2 transform rounded-full bg-[#D9D9D9]" />

        <div className="mt-40 flex flex-col items-center space-y-[1px]">
          <div className="text-[24px] font-bold text-white">
            {firstName} {lastName}
          </div>
          <div className="text-[16px] text-white">
            Member since {memberSince}
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          <div className="flex justify-between">
            <div className="ml-[25px] text-[16px] text-white">
              Phone number
            </div>
            <div className="mr-[25px] text-[16px] text-white">
              {phoneNumber}
            </div>
          </div>

          <div className="flex justify-between gap-31">
            <div className="ml-[25px] text-[16px] text-white">Email</div>
            <div className="flex-1 truncate">
              <div
                title={emailAddress}
                className="mr-[25px] text-[16px] truncate text-[16px] text-white"
              >
                {emailAddress}
              </div>
              <div>
                <button
                  onClick={() => navigator.clipboard.writeText(emailAddress)}
                  className="text-white/70 hover:text-white transition"
                  aria-label="Copy email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button className="ml-[99.62px] mt-[30.82px] h-[44px] w-[113px] rounded-lg border-[1px] bg-white text-black hover:bg-gray-300">
          <div className="text-[16px]">Edit details</div>
        </button>
      </div>

      {/* PAST EVENTS */}
      <div className="mt-[41.05px] ml-[120px]">
        <div className="h-[36.19] w-[283px] text-[28px] font-bold">
          Past Events
        </div>

        <div className="mt-[18px] flex w-[690px] items-center">
          <div className="w-[120px]" />
          <div className="mt-[24.81px] flex-1 text-center text-[14px] font-bold">
            Event name
          </div>
          <div className="mt-[24.81px] w-[170px] text-center text-[14px] font-bold">
            Position
          </div>
          <div className="mt-[24.81px] w-[170px] text-center text-[14px] font-bold">
            Volunteer hours
          </div>
        </div>

        <div className="mt-[7.08px] mb-[96px] h-[155px] w-[690px] border-[2px] border-black bg-white">
          <div className="grid h-full grid-rows-3">
            {[
              {
                month: "OCT",
                day: "01",
                name: "Event Name",
                role: "Volunteer",
                hours: "05",
              },
              {
                month: "OCT",
                day: "01",
                name: "Event Name",
                role: "Volunteer",
                hours: "05",
              },
              {
                month: "OCT",
                day: "01",
                name: "Event Name",
                role: "Volunteer",
                hours: "05",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className={[
                  "grid grid-cols-[120px_1fr_170px_170px] items-center",
                  idx !== 2 ? "border-b border-[#8C8C8C]" : "",
                ].join(" ")}
              >
                <div className="pl-[24px] leading-none">
                  <div className="text-[14px]">OCT</div>
                  <div className="ml-[4px] -mt-[2px] text-[20px] font-bold">
                    01
                  </div>
                </div>

                <div className="text-center text-[16px]">
                  {row.name}
                </div>

                <div className="text-center text-[14px]">
                  {row.role}
                </div>

                <div className="text-center text-[14px]">
                  {row.hours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
