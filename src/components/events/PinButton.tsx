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
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  const router = useRouter();

  const closeModal = () => {
    setModalMessage(null);
    setModalTitle(null);
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (!pinned) {
        const res = await fetch(`/api/events/${eventId}/pin`, {
          method: "POST",
        });

        if (res.ok) {
          setPinned(true);
          setModalTitle("Event Pinned!");
          setModalMessage("The event has been successfully pinned.");
          router.refresh();
        } else {
          setModalTitle("Unable to pin event");
          setModalMessage("Please unpin at least 1 event.");
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/unpin`, {
          method: "POST",
        });

        if (res.ok) {
          setPinned(false);
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Pin error:", error);
      setModalTitle("Error");
      setModalMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Pin Button */}
      <button
        onClick={handlePin}
        disabled={isLoading}
        className={`absolute top-4 right-4 p-2 shadow-lg transition-all duration-200 z-50 ${
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
            fill={pinned ? "#234254" : "#000000"}
          />
        </svg>
      </button>

      {/* Modal */}
      {modalMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white w-[500px] rounded-lg border-2 border-blue-500 p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">{modalTitle}</h2>
            <p className="text-gray-700 mb-6">{modalMessage}</p>

            <button
              onClick={closeModal}
              className="px-6 py-2 rounded-md bg-[#234254] text-white hover:bg-[#1b3443] transition"
            >
              Return
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PinButton;
