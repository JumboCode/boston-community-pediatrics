"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { KebabMenu } from "../common/buttons/KebabMenu";
import PinnedIndicator from "./PinnedIndicator";
import { useEffect } from "react";

interface EventCardProps {
  image: string;
  title: string;
  time: Date;
  location: string;
  date: Date;
  id: string;
  pinned: boolean;
  isAdmin?: boolean;
}

const EventCard = ({
  image,
  title,
  time,
  location,
  date,
  id,
  pinned,
  isAdmin,
}: EventCardProps) => {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const closeModal = () => {
    setModalTitle(null);
    setModalMessage(null);
  };

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formattedTime = new Date(time).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });

  async function handlePinToggle() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const endpoint = pinned ? "unpin" : "pin";
      const res = await fetch(`/api/events/${id}/${endpoint}`, {
        method: "POST",
      });

      if (!res.ok) {
        // Only pin can fail due to the 2-pin rule
        setModalTitle("Unable to pin event");
        setModalMessage("Please unpin at least 1 event.");
        return;
      }

      if (pinned) {
        setModalTitle("Event Unpinned.");
        setModalMessage("The event has been successfully unpinned.");
      } else {
        setModalTitle("Event Pinned!");
        setModalMessage("The event has been successfully pinned.");
      }

      router.refresh();
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const menuItems = isAdmin
    ? [
        {
          label: pinned ? "Unpin" : "Pin",
          onClick: handlePinToggle,
        },
        { label: "Edit", onClick: () => {} },
        {
          label: "Delete",
          danger: true,
          onClick: () => {},
        },
      ]
    : [];

  useEffect(() => {
    if (!modalMessage) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalMessage]);

  return (
    <div className="relative flex flex-col w-[283px] rounded-2xl shadow p-4 gap-2 bg-white">
      <Link href={`/event/${id}`}>
        <Image
          src={image}
          alt={title}
          width={600}
          height={600}
          className="w-full h-[167.53px] object-cover"
        />
      </Link>

      {isAdmin && pinned && <PinnedIndicator />}

      <div className="flex items-start justify-between">
        <Link href={`/event/${id}`}>
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
        </Link>

        {isAdmin && <KebabMenu items={menuItems} />}
      </div>

      <p className="text-sm text-gray-700">{formattedTime}</p>
      <p className="text-sm text-gray-700">{location}</p>
      <p className="text-sm text-gray-700">{formattedDate}</p>

      {modalMessage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[792px] h-[336px] rounded-lg border-2 border-black-500 p-8 shadow-xl flex flex-col items-center justify-center text-center"
          >
            <h2 className="text-4xl mb-4">{modalTitle}</h2>
            <p className="text-xl text-gray-700 mb-6">{modalMessage}</p>

            <button
              onClick={closeModal}
              className="px-16 py-2 rounded-md bg-[#234254] text-white hover:bg-[#1b3443] transition"
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
