"use client";
import EventCard from "@/components/events/EventCard";
// import { useUser } from "@clerk/nextjs";
import { useUser, useClerk } from "@clerk/nextjs"; // <--- 1. Import useClerk
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const [myEvents, setMyEvents] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>("—");
  const [userRole, setUserRole] = useState<string>(""); // <--- NEW STATE

  // 1. Fetch User Phone Number
  useEffect(() => {
    async function fetchPhoneNumber() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/users?id=${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setPhoneNumber(userData.phoneNumber ?? "—");
          setUserRole(userData.role ?? "VOLUNTEER");
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
          const rawData: MyRegistration[] = await response.json();

          // Process images in parallel
          const enrichedData = await Promise.all(
            rawData.map(async (reg) => {
              const images = reg.position.event.images;
              let resolvedUrl = "/event1.jpg"; // Default fallback

              // If we have an image filename, fetch the public URL
              if (images && images.length > 0) {
                try {
                  const filename = images[0];
                  // Call your image API
                  const imgRes = await fetch(`/api/images?filename=${filename}`);
                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    if (imgData.url) {
                      resolvedUrl = imgData.url;
                    }
                  }
                } catch (err) {
                  console.error("Failed to fetch image for event", reg.position.event.id);
                }
              }

              // Return the registration object with the new URL attached
              return { ...reg, imageUrl: resolvedUrl };
            })
          );

          setMyEvents(enrichedData);
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

  // -------------------------------------------------------------
  // ADMIN ACTION: Delete Entire Event
  // -------------------------------------------------------------
  const handleDeleteEvent = async (eventId: string, registrationId?: string) => {
    const confirmDelete = window.confirm("ADMIN ACTION: This will permanently DELETE the entire event. Are you sure?");
    if (!confirmDelete) return;

    if (eventId.startsWith("evt-") || eventId === "demo-event") {
      alert("Demo event deleted.");
      return;
    }

    try {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // If successful, remove the card from the UI
        // We use the registrationId to filter it out of the local state array
        if (registrationId) {
          setMyEvents((prev) => prev.filter((evt) => evt.id !== registrationId));
        } else {
          // Fallback: reload page if we can't find the specific card ID
          window.location.reload();
        }
        alert("Event successfully deleted.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("An error occurred while deleting the event.");
    }
  }

  if (!isLoaded || loading) {
    return <main className="min-h-screen p-8" />;
  }

  const firstName = isSignedIn ? (user?.firstName ?? "") : "Guest";
  const lastName = isSignedIn ? (user?.lastName ?? "") : "";
  const emailAddress = isSignedIn
    ? (user?.primaryEmailAddress?.emailAddress ?? "—")
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

  // upcoming = DEMO_UPCOMING_EVENTS; // remove this after testing

  // Sort Past events: Most recent first (Descending)
  past.sort((a, b) => {
    const dateA = new Date(a.position.event.date[0]).getTime();
    const dateB = new Date(b.position.event.date[0]).getTime();
    return dateB - dateA;
  });

  const isAdmin = userRole === "ADMIN";

  return (
    <main className="min-h-screen p-8">
      <div className="w-full flex justify-center mt-3">
        <button
          onClick={() => signOut(() => router.push("/"))}
          className="text-black text-sm hover:text-red-200 transition-colors font-medium underline decoration-transparent hover:decoration-red-200"
        >
          Sign Out
        </button>
      </div>
      {/* UPCOMING EVENTS */}
      <div className="mt-[142px] ml-[120px] flex items-center gap-3">
        <div className="h-[36.19] w-[283px] text-[28px] font-bold">
          Upcoming Events
        </div>
      </div>

      <div className="mt-[54px] ml-[120px] grid grid-cols-3 gap-[50px] max-w-[800px]">
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
                image={reg.imageUrl || "/event1.jpg"}
                title={event.name}
                startTime={new Date(event.startTime)}
                endTime={new Date(reg.position.endTime)}
                location={event.addressLine1}
                date={firstDate}
                filledSlots={reg.position.filledSlots}
                totalSlots={reg.position.totalSlots}

                userRole={userRole}

                // 👇 THIS IS THE FIX: Pass the positionId to the register page
                // CONDITIONAL ACTIONS
                onEdit={() => {
                  if (isAdmin) {
                    // Admin -> Go to Event Details Page
                    router.push(`/event/${event.id}`);
                  } else {
                    // User -> Go to Registration Page
                    router.push(`/register/${reg.positionId}`);
                  }
                }}

                onRemove={() => {
                  if (isAdmin) {
                    // Admin -> Delete Event API
                    handleDeleteEvent(event.id, reg.id);
                  } else {
                    // User -> Cancel Signup API
                    handleRemove(reg.id);
                  }
                }}
                onVolunteer={() => router.push(`/event/${event.id}`)}
              />
            );
          })
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="absolute top-[248px] right-[121px] h-[420px] w-[305px] rounded-lg bg-light-bcp-blue">
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
            <div className="ml-[25px] text-[16px] text-white">Phone number</div>
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
      <div className="mt-[41px] ml-[120px] mb-20">
        <h2 className="text-[28px] font-bold mb-6">Your Past Events</h2>

        {/* Card Container */}
        <div className="w-[690px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[80px_1.5fr_1.5fr_80px] border-b border-gray-200 bg-white py-4 px-4">
            {/* Empty space above Date */}
            <div className=""></div>
            <div className="text-left text-[14px] font-medium text-gray-900">
              Event
            </div>
            <div className="text-left text-[14px] font-medium text-gray-900">
              Position
            </div>
            <div className="text-center text-[14px] font-medium text-gray-900">
              Hours
            </div>
          </div>

          {/* Table Body - Scrollable to match screenshot scrollbar */}
          <div className="max-h-[320px] overflow-y-auto">
            {past.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No past events found.
              </div>
            ) : (
              past.map((reg, idx) => {
                const dateObj = new Date(reg.position.event.date[0]);
                const month = dateObj
                  .toLocaleString("default", { month: "short" })
                  .toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, "0");

                // Calculate duration in hours
                const start = new Date(reg.position.event.startTime).getTime();
                const end = new Date(reg.position.endTime).getTime();
                const hoursVal = !isNaN(end - start)
                  ? (end - start) / (1000 * 60 * 60)
                  : 0;

                // Format: if whole number show "5", if decimal show "5.5"
                const hoursDisplay =
                  hoursVal % 1 === 0 ? hoursVal.toString() : hoursVal.toFixed(1);

                return (
                  <div
                    key={reg.id}
                    className="grid grid-cols-[80px_1.5fr_1.5fr_80px] items-center border-b border-gray-100 py-4 px-4 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    {/* Date Column */}
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className="text-[11px] font-bold uppercase text-gray-500">
                        {month}
                      </span>
                      <span className="text-[22px] font-bold text-black">
                        {day}
                      </span>
                    </div>

                    {/* Event Name */}
                    <div className="text-[16px] font-medium text-black truncate pr-2">
                      {reg.position.event.name}
                    </div>

                    {/* Position */}
                    <div className="text-[14px] text-gray-600 truncate pr-2">
                      {reg.position.position}
                    </div>

                    {/* Hours */}
                    <div className="text-[14px] font-medium text-black text-center">
                      {hoursDisplay}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
    </main>
  );
}
