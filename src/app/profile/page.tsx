"use client";

import EventCard from "@/components/events/EventCard";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define the shape of the data from our API
interface MyRegistration {
  id: string; // Registration ID
  positionId: string;
  status: string;
  position: {
    id: string;
    position: string;
    endTime: string;
    event: {
      id: string;
      name: string;
      startTime: string; // ISO String
      addressLine1: string;
      date: string[]; // ISO String array
      images: string[];
    };
  };
}

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [myEvents, setMyEvents] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>("—");

  // 1. Fetch User Phone Number
  useEffect(() => {
    async function fetchPhoneNumber() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/users?id=${user.id}`);
        if (response.ok) {
          const userData = await response.json();
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

  // 2. Fetch User Registrations (My Events)
  useEffect(() => {
    async function fetchMyData() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/registrations?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMyEvents(data);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchMyData();
    }
  }, [user?.id, isLoaded, isSignedIn]);

  // 1. ADD THIS FUNCTION
  const handleRemove = async (registrationId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove yourself from this event?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/registrations?id=${registrationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local state immediately to update UI
        setMyEvents((prev) => prev.filter((evt) => evt.id !== registrationId));
        alert("You have been removed from the event.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove registration.");
      }
    } catch (error) {
      console.error("Error removing registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

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

  // --- FILTERING LOGIC ---
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming: MyRegistration[] = [];
  const past: MyRegistration[] = [];

  // Separate events into Upcoming and Past
  myEvents.forEach((reg) => {
    if (!reg.position?.event?.date || reg.position.event.date.length === 0) return;

    const eventDate = new Date(reg.position.event.date[0]);

    // Sort into buckets
    if (eventDate >= now) {
      upcoming.push(reg);
    } else {
      past.push(reg);
    }
  });

  // Sort Past events: Most recent first (Descending)
  past.sort((a, b) => {
    const dateA = new Date(a.position.event.date[0]).getTime();
    const dateB = new Date(b.position.event.date[0]).getTime();
    return dateB - dateA;
  });

  return (
    <main className="min-h-screen p-8">
      {/* UPCOMING EVENTS */}
      <div className="mt-[142px] ml-[120px] flex items-center gap-3">
        <div className="h-[36.19] w-[283px] text-[28px] font-bold">
          Uupcoming Events
        </div>
      </div>

      <div className="mt-[54px] ml-[120px] flex flex-wrap gap-[25px]">
        {upcoming.length === 0 ? (
          <p className="text-lg text-gray-500">No upcoming events found.</p>
        ) : (
          upcoming.map((reg) => {
            const event = reg.position.event;
            const firstDate = event.date && event.date.length > 0 ? new Date(event.date[0]) : new Date();

            return (
              <EventCard
                key={reg.id}
                id={event.id} // Link to the general event page
                image="/event1.jpg" // Fallback or use event.images[0]
                title={event.name}
                startTime={new Date(event.startTime)}
                endTime={new Date(reg.position.endTime)}
                location={event.addressLine1}
                date={firstDate}

                // 👇 THIS IS THE FIX: Pass the positionId to the register page
                onEdit={() => router.push(`/register/${reg.positionId}`)}

                onVolunteer={() => router.push(`/event/${event.id}`)}
                onRemove={() => handleRemove(reg.id)} />
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
      {/* PAST EVENTS SECTION */}
      <div className="mt-[41.05px] ml-[120px]">
        <div className="h-[36.19] w-[283px] text-[28px] font-bold">
          Past Events
        </div>

        {/* Table Header */}
        <div className="mt-[18px] flex w-[690px] items-center">
          <div className="w-[120px]" />
          <div className="mt-[24.81px] flex-1 text-center text-[14px] font-bold">Event name</div>
          <div className="mt-[24.81px] w-[170px] text-center text-[14px] font-bold">Position</div>
          <div className="mt-[24.81px] w-[170px] text-center text-[14px] font-bold">Volunteer hours</div>
        </div>

        {/* Table Body */}
        <div className="mt-[7.08px] mb-[96px] w-[690px] border-[2px] border-black bg-white">
          {past.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No past events found.</div>
          ) : (
            <div className="flex flex-col">
              {past.map((reg, idx) => {
                const dateObj = new Date(reg.position.event.date[0]);
                const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, '0');

                // Calculate duration in hours
                const start = new Date(reg.position.event.startTime).getTime();
                const end = new Date(reg.position.endTime).getTime(); // Position needs endTime in query!
                const hours = !isNaN(end - start)
                  ? ((end - start) / (1000 * 60 * 60)).toFixed(1) // e.g., "5.0"
                  : "—";

                const isLast = idx === past.length - 1;

                return (
                  <div
                    key={reg.id}
                    className={[
                      "grid grid-cols-[120px_1fr_170px_170px] items-center h-[52px]", // Fixed height per row
                      !isLast ? "border-b border-[#8C8C8C]" : "",
                    ].join(" ")}
                  >
                    {/* Date Column */}
                    <div className="pl-[24px] leading-none">
                      <div className="text-[14px]">{month}</div>
                      <div className="ml-[4px] -mt-[2px] text-[20px] font-bold">
                        {day}
                      </div>
                    </div>

                    {/* Name Column */}
                    <div className="text-center text-[16px] truncate px-2">
                      {reg.position.event.name}
                    </div>

                    {/* Position Column */}
                    <div className="text-center text-[14px] truncate px-2">
                      {reg.position.position}
                    </div>

                    {/* Hours Column */}
                    <div className="text-center text-[14px]">
                      {hours}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
