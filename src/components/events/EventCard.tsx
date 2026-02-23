"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { KebabMenu } from "../common/buttons/KebabMenu";
import PinnedIndicator from "./PinnedIndicator";
import { useEffect } from "react";
import Modal from "../common/Modal";

interface EventCardProps {
  image: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  filledSlots: number;
  totalSlots: number;
  userRole: string;
  date: Date;
  id: string;
  pinned: boolean;
  isAdmin?: boolean;
}

const EventCard = ({
  image,
  title,
  startTime,
  endTime,
  location,
  filledSlots,
  totalSlots,
  userRole,
  date,
  id,
  pinned,
  isAdmin,
}: EventCardProps) => {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // TODO: What my colleague meant to say was that currently setting it only to
  // "date" makes all events not show up, startTime does but all the times are
  // wrong. Please fix at your earliest convenience 
  const formattedTime = new Date(startTime).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });

  const closeModal = useCallback(() => {
    setModalTitle(null);
    setModalMessage(null);
    router.refresh();
  }, [router]);

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
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setModalTitle("Error");
        setModalMessage("Failed to delete event. Please try again.");
        setShowDeleteConfirm(false);
        return;
      }

      setModalTitle("Event Deleted!");
      setModalMessage("The event has been successfully deleted.");
      setShowDeleteConfirm(false);

      // Redirect after a short delay to show the confirmation message
      setTimeout(() => {
        router.push("/event");
        router.refresh();
      }, 1500);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("Something went wrong. Please try again.");
      setShowDeleteConfirm(false);
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
        {
          label: "Edit",
          onClick: () => router.push(`/event/createEvent?id=${id}`),
        },
        {
          label: "Delete",
          danger: true,
          onClick: () => setShowDeleteConfirm(true),
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
  }, [modalMessage, closeModal]);

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

      {modalMessage && modalTitle && (
        <Modal
          open={true}
          title={modalTitle}
          message={modalMessage}
          onClose={closeModal}
          buttons={[
            {
              label: "Return",
              variant: "primary",
              onClick: closeModal,
            },
          ]}
        />
      )}

      {showDeleteConfirm && (
        <Modal
          open={showDeleteConfirm}
          title="Delete Event?"
          message="Are you sure you want to delete this event? This action cannot be undone."
          onClose={() => setShowDeleteConfirm(false)}
          buttons={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setShowDeleteConfirm(false),
              disabled: isLoading,
            },
            {
              label: "Delete",
              variant: "primary",
              onClick: handleDelete,
              disabled: isLoading,
            },
          ]}
        />
      )}
    </div>
  );
};

export default EventCard;
