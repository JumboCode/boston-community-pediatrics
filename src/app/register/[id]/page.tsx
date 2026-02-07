"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, use } from "react";
import EventSignUpForm from "@/components/common/forms/EventSignUpForm";

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
  date?: string;
  time?: string;
}

interface PositionData {
  id: string;
  position: string;
  description: string;
  event?: EventData;
}

interface PageData {
  user: UserData;
  position: PositionData;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = use(params);
  const positionId = resolvedParams.id;
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id || !positionId) {
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data - if user doesn't exist, create them
        let userRes = await fetch(`/api/users?id=${user.id}`);
        
        let userData;
        if (!userRes.ok && userRes.status === 404) {
          // User not found - create them from Clerk data
          console.log("User not found in database, creating from Clerk data...");
          
          // Create user with minimal required fields
          const createRes = await fetch(`/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: {
                id: user.id,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                emailAddress: user.primaryEmailAddress?.emailAddress || "",
                phoneNumber: user.primaryPhoneNumber?.phoneNumber || "",
                // Provide default/placeholder values for required fields
                dateOfBirth: "2000-01-01", // Placeholder - user can update later
                streetAddress: "",
                city: "",
                state: "",
                zipCode: "",
                role: "VOLUNTEER",
              },
            }),
          });

          if (!createRes.ok) {
            const errorText = await createRes.text();
            console.error("Failed to create user:", errorText);
            setError(`Failed to create user: ${createRes.status}`);
            setData(null);
            return;
          }

          userData = await createRes.json();
          console.log("User created successfully:", userData);
        } else if (!userRes.ok) {
          // Some other error
          const errorText = await userRes.text();
          console.error("User API failed:", errorText);
          setError(`User API error: ${userRes.status} - ${errorText}`);
          setData(null);
          return;
        } else {
          // User exists
          userData = await userRes.json();
        }

        // Fetch position data
        const posRes = await fetch(`/api/eventPosition?id=${positionId}`);

        if (!posRes.ok) {
          const errorText = await posRes.text();
          console.error("Position API failed:", errorText);
          setError(`Position API error: ${posRes.status} - ${errorText}`);
          setData(null);
          return;
        }

        const positionData = await posRes.json();

        setData({ user: userData, position: positionData });
        setError(null);
      } catch (error) {
        console.error("Data fetch failed:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, user, positionId]);

  if (!isLoaded || loading)
    return <div className="text-center p-10">Loading...</div>;

  if (!data)
    return (
      <div className="text-center p-10">
        <p className="text-red-600 font-semibold">Error loading details.</p>
        {error && (
          <p className="text-sm text-gray-600 mt-2">Debug info: {error}</p>
        )}
      </div>
    );

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
        userData={data.user}
        positionData={data.position}
        eventName={data.position.event?.name}
        eventDate={formatDate(data.position.event?.date)}
        eventTime={formatTime(data.position.event?.time)}
      />
    </div>
  );
}