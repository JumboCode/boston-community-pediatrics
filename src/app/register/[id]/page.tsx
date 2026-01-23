"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, use } from "react"; 
import EventSignUpForm from "@/components/common/forms/EventSignUpForm";

interface RegisterPageProps {
  params: Promise<{ id: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = use(params);
  const positionId = resolvedParams.id;

  const { user, isLoaded } = useUser();
  const [data, setData] = useState<any>(null); // keeping type loose for simplicity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.id) {
      const fetchData = async () => {
        try {
          const [userRes, posRes] = await Promise.all([
            fetch(`/api/users?id=${user.id}`),
            fetch(`/api/eventPosition?id=${positionId}`) 
          ]);

          if (userRes.ok && posRes.ok) {
            const userData = await userRes.json();
            const positionData = await posRes.json(); 
            
            // positionData now looks like: 
            // { id: "...", position: "Volunteer", event: { name: "Gala", date: "..." } }
            
            setData({ user: userData, position: positionData });
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

  if (!isLoaded || loading) return <div className="text-center p-10">Loading...</div>;
  if (!data) return <div className="text-center p-10">Error loading details.</div>;

  // --- Helper to format dates ---
  // The DB returns ISO strings (e.g. "2025-01-01T00:00:00.000Z")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US"); // "1/1/2025"
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "TBD";
    return new Date(timeStr).toLocaleTimeString("en-US", { 
      hour: 'numeric', minute: '2-digit' 
    }); // "10:00 AM"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <EventSignUpForm 
        userData={data?.user} 
        positionData={data?.position} // Pass the position object directly
        
        // 👇 PASS THE DATA HERE
        eventName={data?.position?.event?.name}
        eventDate={formatDate(data?.position?.event?.date)}
        eventTime={formatTime(data?.position?.event?.time)}
      />
    </div>
  );
}