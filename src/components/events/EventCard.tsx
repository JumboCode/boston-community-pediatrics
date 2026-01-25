"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface EventCardProps {
  image: string;
  title: string;
  time: Date;
  location: string;
  date: Date;
  id: string;
  pinned: boolean;
  children?: React.ReactNode;
}

const EventCard = ({
  image,
  title,
  time,
  location,
  date,
  id,
  children,
}: EventCardProps) => {
  // Format time to EST
  const formattedTime = new Date(time).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  // Format date to EST
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });

  return (
    <Link
      href={`/event/${id}`}
      className="relative flex flex-col w-72 rounded-2xl shadow p-4 gap-2 bg-white"
    >
      <Image
        src={image}
        alt={title}
        width={600}
        height={600}
        className="w-full h-40 object-cover rounded-xl"
      />

      {/* Admin-only pin button injected from parent - MOVED AFTER IMAGE */}
      {children}

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-700">{formattedTime}</p>
      <p className="text-sm text-gray-700">{location}</p>
      <p className="text-sm text-gray-700">{formattedDate}</p>
    </Link>
  );
};

export default EventCard;