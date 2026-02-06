"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PinButtonProps {
  eventId: string;
  pinned: boolean;
}

function PinButton({ eventId, pinned: initialPinned }: PinButtonProps) {
  const [pinned, setPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (pinned) {
        const res = await fetch(`/api/events/${eventId}/unpin`, {
          method: "POST",
        });

        if (res.ok) {
          setPinned(false);
          router.refresh();
        } else {
          const data = await res.text();
          alert(data || "Failed to unpin event");
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/pin`, {
          method: "POST",
        });

        if (res.ok) {
          setPinned(true);
          router.refresh();
        } else {
          const data = await res.text();
          alert(data || "Cannot pin event. Maximum 2 events can be pinned.");
        }
      }
    } catch (error) {
      console.error("Pin error:", error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePin}
      disabled={isLoading}
      className={`absolute top-4 right-4 p-2  shadow-lg transition-all duration-200 z-50 ${
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
      }`}
      title={pinned ? "Unpin event" : "Pin event"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"
          fill={pinned ? "#" : "#000000"}
        />
      </svg>
    </button>
  );
}

export default PinButton;
