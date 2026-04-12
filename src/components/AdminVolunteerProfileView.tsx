"use client";

import ProfileEventCard from "@/components/events/ProfileEventCard";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import blankProfile from "@/assets/icons/Group 1.svg";
import Link from "next/link";
import ProfilePageSkeleton from "@/components/ui/skeleton/ProfilePageSkeleton";

type Registration = {
  id: string;
  userId: string;
  position: {
    id: string;
    position: string;
    startTime: string;
    endTime: string;
    filledSlots: number;
    totalSlots: number;
    event: {
      id: string;
      name: string;
      date: string[];
      addressLine1: string;
      images: string[];
    };
  };
  imageUrl?: string;
};

type VolunteerProfile = {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  role?: string;
  profileImage?: string | null;
  createdAt?: string;
};

function normalizeProfileImageUrl(value?: string | null) {
  if (!value) return value ?? null;
  if (!value.startsWith("http")) return value;
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return url.toString();
  } catch {
    return value;
  }
}

export default function AdminVolunteerProfileView({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const router = useRouter();
  const { signOut } = useClerk();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  async function handleRemoveRegistration(registrationId: string) {
    const confirmed = window.confirm(
      "Remove this volunteer from the event?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/registrations?id=${registrationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove registration");
      }

      setRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId));
    } catch (err) {
      console.error("Failed to remove volunteer from event:", err);
      window.alert("Failed to remove volunteer from event.");
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [userRes, registrationsRes] = await Promise.all([
          fetch(`/api/users?id=${targetUserId}`),
          fetch(`/api/registrations?userId=${targetUserId}`),
        ]);

        if (!userRes.ok) {
          throw new Error("Failed to load volunteer profile");
        }

        const userData = (await userRes.json()) as VolunteerProfile;
        setProfile(userData);

        if (!registrationsRes.ok) {
          setRegistrations([]);
          return;
        }

        const rawData = (await registrationsRes.json()) as Registration[];
        const enrichedData = await Promise.all(
          rawData.map(async (reg) => {
            const images = reg.position.event.images;
            let resolvedUrl = "/event1.jpg";

            if (images && images.length > 0) {
              try {
                const filename = images[0];
                const imgRes = await fetch(`/api/images?filename=${filename}`);
                if (imgRes.ok) {
                  const imgData = await imgRes.json();
                  if (imgData.url) {
                    resolvedUrl = imgData.url;
                  }
                }
              } catch {
                console.error(
                  "Failed to fetch image for event",
                  reg.position.event.id,
                );
              }
            }

            return { ...reg, imageUrl: resolvedUrl };
          }),
        );

        setRegistrations(enrichedData);
      } catch (err) {
        console.error("Failed to load admin volunteer profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [targetUserId]);

  const emailAddress = profile?.emailAddress ?? "—";
  const phoneNumber = profile?.phoneNumber ?? "—";
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : "0000";
  const profileImageUrl = normalizeProfileImageUrl(profile?.profileImage);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingEvents: Registration[] = [];
    const pastEvents: Registration[] = [];

    registrations.forEach((reg) => {
      if (!reg.position?.event?.date || reg.position.event.date.length === 0) {
        return;
      }

      const eventDate = new Date(reg.position.event.date[0]);
      if (eventDate >= now) {
        upcomingEvents.push(reg);
      } else {
        pastEvents.push(reg);
      }
    });

    pastEvents.sort((a, b) => {
      const dateA = new Date(a.position.event.date[0]).getTime();
      const dateB = new Date(b.position.event.date[0]).getTime();
      return dateB - dateA;
    });

    return { upcoming: upcomingEvents, past: pastEvents };
  }, [registrations]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-lg text-gray-700">Volunteer profile not found.</p>
          <button
            onClick={() => router.push("/admin/manage")}
            className="mt-4 rounded-lg bg-bcp-blue px-4 py-2 text-white"
          >
            Back to Manage Roles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mt-[40px] ml-[120px]">
        <Link href="/admin/manage" className="text-bcp-blue hover:underline">
          Back to Manage Roles
        </Link>
      </div>

      <div className="mt-[60px] ml-[120px] flex items-center gap-3">
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
            const firstDate =
              event.date && event.date.length > 0
                ? new Date(event.date[0])
                : new Date();

            return (
              <ProfileEventCard
                key={reg.id}
                id={event.id}
                image={reg.imageUrl || "/event1.jpg"}
                title={event.name}
                startTime={new Date(reg.position.startTime)}
                endTime={new Date(reg.position.endTime)}
                location={event.addressLine1}
                date={firstDate}
                filledSlots={reg.position.filledSlots}
                totalSlots={reg.position.totalSlots}
                userRole="ADMIN"
                onRemove={() => handleRemoveRegistration(reg.id)}
              />
            );
          })
        )}
      </div>

      <div className="absolute top-[248px] right-[121px] h-[420px] w-[360px] rounded-2xl bg-light-bcp-blue">
        <div className="absolute top-[30px] left-1/2 -translate-x-1/2">
          <Image
            src={profileImageUrl ?? blankProfile}
            alt="Profile"
            width={105}
            height={105}
            className="h-[105px] w-[105px] rounded-full object-cover"
            unoptimized={!!profileImageUrl}
          />
        </div>

        <div className="mt-40 flex flex-col items-center space-y-[1px]">
          <div
            title={`${firstName} ${lastName}`}
            className="text-[24px] font-bold text-white max-w-[320px] truncate whitespace-nowrap px-3"
          >
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

          <div className="flex flex-row justify-between items-center gap-10">
            <div className="ml-[25px] text-[16px] text-white">Email</div>
            <div className="flex items-center gap-2 mr-[25px] min-w-0">
              <div
                title={emailAddress}
                className="text-[16px] text-white truncate"
              >
                {emailAddress}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(emailAddress)}
                className="text-white/70 hover:text-white transition flex-shrink-0"
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

        <div className="flex justify-center gap-4 mt-[30.82px]">
          <button
            onClick={() => router.push("/admin/manage")}
            className="h-[44px] w-[140px] rounded-lg bg-white text-black hover:bg-gray-300"
          >
            <div className="text-[16px]">Back to roles</div>
          </button>
          <button
            className="h-[44px] w-[113px] rounded-lg bg-bcp-blue text-white hover:bg-gray-600 cursor-pointer"
            onClick={() => signOut(() => router.push("/"))}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="mt-[41px] ml-[120px] mb-20">
        <h2 className="text-[28px] font-bold mb-6">Past Events</h2>

        <div className="w-[690px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[80px_1.5fr_1.5fr_80px] border-b border-gray-200 bg-white py-4 px-4">
            <div></div>
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

          <div className="max-h-[320px] overflow-y-auto">
            {past.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No past events found.
              </div>
            ) : (
              past.map((reg) => {
                const dateObj = new Date(reg.position.event.date[0]);
                const month = dateObj
                  .toLocaleString("default", { month: "short" })
                  .toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, "0");

                const start = new Date(reg.position.event.startTime).getTime();
                const end = new Date(reg.position.endTime).getTime();
                const hoursVal = !isNaN(end - start)
                  ? (end - start) / (1000 * 60 * 60)
                  : 0;
                const hoursDisplay =
                  hoursVal % 1 === 0
                    ? hoursVal.toString()
                    : hoursVal.toFixed(1);

                return (
                  <Link href={`/event/${reg.position.event.id}`} key={reg.id}>
                    <div className="grid grid-cols-[80px_1.5fr_1.5fr_80px] items-center border-b border-gray-100 py-4 px-4 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="text-[11px] font-bold uppercase text-gray-500">
                          {month}
                        </span>
                        <span className="text-[22px] font-bold text-black">
                          {day}
                        </span>
                      </div>

                      <div className="text-[16px] font-medium text-black truncate pr-2">
                        {reg.position.event.name}
                      </div>

                      <div className="text-[14px] text-gray-600 truncate pr-2">
                        {reg.position.position}
                      </div>

                      <div className="text-[14px] font-medium text-black text-center">
                        {hoursDisplay}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
