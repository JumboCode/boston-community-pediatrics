"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, use } from "react";
import EventSignUpForm from "@/components/common/forms/EventSignUpForm";
import BasicSkeleton from "@/components/ui/skeleton/BasicSkeleton";
import { getPublicURL } from "@/lib/r2";

interface RegisterPageProps {
  params: Promise<{ id: string }>;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  dateOfBirth?: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  month: string;
  day: string;
  year: string;
  speaksSpanish: boolean;
  relationship: string;
}

interface EventData {
  name: string;
  date?: string | string[];
  startTime?: string;
  endTime?: string;
  images?: string[];
}

interface PositionData {
  id: string;
  position: string;
  description: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  event?: EventData;
}

interface PageData {
  user: UserData | null; // Allow null here
  position: PositionData;
  existingRegistrationId: string | null; // fixed: string || null is not valid TS
  existingGuests: Guest[];
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = use(params);
  const positionId = resolvedParams.id;

  const { user, isLoaded } = useUser();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only wait for Clerk to finish checking auth status (isLoaded), don't require user.id
    if (isLoaded) {
      const fetchData = async () => {
        try {
          // 1. Always fetch the position data
          const posRes = await fetch(`/api/eventPosition?id=${positionId}`);
          if (!posRes.ok) throw new Error("Position not found");
          const positionData = await posRes.json();

          // 2. Only fetch user data if they are logged in
          let userData = null;
          let existingRegistrationId: string | null = null; //fetch id
          let existingGuests: Guest[] = []; //fetch guest count
          if (user?.id) {
            const userRes = await fetch(`/api/users?id=${user.id}`);
            if (userRes.ok) {
              userData = await userRes.json();
            }

            // Check if user already has a registration for this position
            const regRes = await fetch(`/api/registrations?userId=${user.id}&positionId=${positionId}`);
            if (regRes.ok) {
              const regData = await regRes.json();
              const reg = Array.isArray(regData)
                ? regData.find((r) => r.positionId === positionId)
                : regData;

              if (reg?.id) {
                existingRegistrationId = reg.id;
                existingGuests = (reg.guests ?? []).map((g: {
                  id: string;
                  firstName: string;
                  lastName: string;
                  emailAddress?: string;
                  phoneNumber?: string;
                  dateOfBirth?: string;
                  speaksSpanish?: boolean;
                  relation?: string;
                }) => {
                  const dob = g.dateOfBirth ?? "";
                  const [year = "", month = "", day = ""] = dob.split("-");
                  return {
                    id: g.id,
                    firstName: g.firstName ?? "",
                    lastName: g.lastName ?? "",
                    email: g.emailAddress ?? "",
                    phoneNumber: g.phoneNumber ?? "",
                    dateOfBirth: dob,
                    month, day, year,
                    speaksSpanish: g.speaksSpanish ?? false,
                    relationship: g.relation ?? "",
                  };
                });
              }
            }
          }

          // 3. Set the data so the form can render
          setData({ user: userData, position: positionData, existingRegistrationId, existingGuests });
        } catch (error) {
          console.error("Data fetch failed", error);
        } finally {
          // Stop loading no matter what
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isLoaded, user?.id, positionId]);

  if (!isLoaded || loading) return <BasicSkeleton />;
  if (!data) return <div className="text-center p-10">Error loading details.</div>;

  const toDate = (value?: string | Date | null) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (value?: string | Date | null) => {
    const d = toDate(value);
    if (!d) return "TBD";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value?: string | Date | null) => {
    const d = toDate(value);
    if (!d) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isSameCalendarDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const pos = data.position;
  const evt = pos.event;

  const startDt =
    toDate(pos.startTime) ??
    toDate(pos.date) ??
    toDate(evt?.startTime) ??
    toDate(Array.isArray(evt?.date) ? evt?.date[0] : evt?.date);
  const endDt = toDate(pos.endTime) ?? toDate(evt?.endTime);

  let eventDateLabel = "TBD";
  let eventTimeLabel = "TBD";

  if (startDt && endDt) {
    if (isSameCalendarDay(startDt, endDt)) {
      eventDateLabel = formatDate(startDt);
      eventTimeLabel = `${formatTime(startDt)} – ${formatTime(endDt)}`;
    } else {
      eventDateLabel = `${formatDate(startDt)} – ${formatDate(endDt)}`;
      eventTimeLabel = `${formatTime(startDt)} – ${formatTime(endDt)}`;
    }
  } else if (startDt) {
    eventDateLabel = formatDate(startDt);
    eventTimeLabel = formatTime(startDt) || "TBD";
  }

  const rawImage = evt?.images?.[0];
  const eventImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : getPublicURL(rawImage)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <EventSignUpForm
        userData={data.user}
        positionData={data.position}
        eventName={data.position.event?.name}
        eventDate={eventDateLabel}
        eventTime={eventTimeLabel}
        eventImage={eventImage}
        initialRegistrationId={data.existingRegistrationId}
        initialGuests={data.existingGuests}
      />
    </div>
  );
}