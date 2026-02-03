"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, use } from "react"; 
import EventSignUpForm from "@/components/common/forms/EventSignUpForm";

interface RegisterPageProps {
  params: Promise<{ id: string }>;
}

// --- Types ---
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
  date: string; // or Date[] depending on your prisma response
  time: string; // or Date
}

interface PositionData {
  id: string;
  position: string;
  description: string;
  event?: {
    name: string;
    date: string[];
    startTime: string;
  }; 
}

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  relationship: string;
  comments: string;
}

interface RegistrationData {
  id: string;
  status: "registered" | "waitlisted";
  guests: GuestData[];
}

interface PageData {
  user: UserData;
  position: PositionData;
  registration?: RegistrationData | null;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = use(params);
  const positionId = resolvedParams.id; // This is the ID from the URL

  const { user, isLoaded } = useUser();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.id) {
      const fetchData = async () => {
        try {
          // 1. Fetch User and Position Details in parallel
          const [userRes, posRes] = await Promise.all([
            fetch(`/api/users?id=${user.id}`),
            fetch(`/api/eventPosition?id=${positionId}`)
          ]);

          let userData: UserData | null = null;
          let positionData: PositionData | null = null;
          let registrationData: RegistrationData | null = null;

          if (userRes.ok) userData = await userRes.json();
          if (posRes.ok) positionData = await posRes.json();

          // 2. If we found the user and position, check for an existing registration
          if (userData && positionData) {
            try {
              const regRes = await fetch(
                `/api/registrations?userId=${userData.id}&positionId=${positionId}`
              );
              
              if (regRes.ok) {
                // If 200 OK, we have a registration (either signed up or waitlisted)
                registrationData = await regRes.json();
              }
            } catch (err) {
              console.warn("No existing registration found (this is normal for new signups)");
            }
          }

          if (userData && positionData) {
            setData({ 
              user: userData, 
              position: positionData, 
              registration: registrationData 
            });
          }

        } catch (error) {
          console.error("Data fetch failed", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isLoaded, user?.id, positionId]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading details...</div>
      </div>
    );
  }

  if (!data || !data.user || !data.position) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading event details. Please try again.
      </div>
    );
  }

  // Helper to safely format array or string dates
  const eventDateStr = Array.isArray(data.position.event?.date) 
    ? data.position.event?.date[0] 
    : data.position.event?.date;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US") : "TBD";
  const formatTime = (t?: string) => t ? new Date(t).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' }) : "TBD";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <EventSignUpForm 
        userData={data.user} 
        positionData={data.position} 
        
        // Display Info
        eventName={data.position.event?.name}
        eventDate={formatDate(eventDateStr)}
        eventTime={formatTime(data.position.event?.startTime)}
        
        // Pre-fill Data (if existing registration found)
        initialRegistrationId={data.registration?.id}
        initialGuests={data.registration?.guests || []}
      />
    </div>
  );
}