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
        userData={data.user} //will be null if unauthenticated
        positionData={data.position}
        eventName={data.position.event?.name}
        eventDate={formatDate(data.position.event?.date)}
        eventTime={formatTime(data.position.event?.time)}
        initialRegistrationId={data.existingRegistrationId}
        initialGuests={data.existingGuests}
      />
    </div>
  );
}