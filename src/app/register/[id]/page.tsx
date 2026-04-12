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
  date: string;
  time: string;
}

interface PositionData {
  id: string;
  position: string;
  description: string;
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US");
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "TBD";
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <EventSignUpForm
        userData={data.user} // This will now be null if unauthenticated, triggering your modal
        positionData={data.position}
        eventName={data.position.event?.name}
        eventDate={formatDate(data.position.event?.date)}
        eventTime={formatTime(data.position.event?.time)}
      />
    </div>
  );
}