"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, use } from "react";
import EventSignUpForm from "@/components/common/forms/EventSignUpForm";
import BasicSkeleton from "@/components/ui/skeleton/BasicSkeleton";

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

interface EventData {
  name: string;
  date?: string | string[];
  startTime?: string;
  endTime?: string;
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
          if (user?.id) {
            const userRes = await fetch(`/api/users?id=${user.id}`);
            if (userRes.ok) {
              userData = await userRes.json();
            }
          }

          // 3. Set the data so the form can render
          setData({ user: userData, position: positionData });
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <EventSignUpForm
        userData={data.user} // This will now be null if unauthenticated, triggering your modal
        positionData={data.position}
        eventName={data.position.event?.name}
        eventDate={eventDateLabel}
        eventTime={eventTimeLabel}
      />
    </div>
  );
}