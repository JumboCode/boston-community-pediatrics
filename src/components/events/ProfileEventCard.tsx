"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface ProfileEventCardProps {
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
   positionName: string;
  onEdit?: () => void;
  onRemove?: () => void;
  onVolunteer?: () => void;
}

const ProfileEventCard = ({
  image,
  title,
  startTime,
  endTime,
  location,
  filledSlots,
  totalSlots,
  userRole,
  positionName,
  date,
  id,
  onEdit,
  onRemove,
  onVolunteer,
}: ProfileEventCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  

  const isAdmin = userRole === "ADMIN";
  const hasMenuActions = isAdmin
    ? Boolean(onEdit || onRemove || onVolunteer)
    : Boolean(onEdit || onRemove);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (d: Date) => {
    if (!d || isNaN(d.getTime())) return "undefined";
    return d.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;

  const startDateStr = new Date(startTime).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  const endDateStr = new Date(endTime).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  const formattedDate =
    startDateStr === endDateStr
      ? startDateStr
      : `${startDateStr} - ${endDateStr}`;

  const handleMenuClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (action) action();
    setShowMenu(false);
  };

  return (
    <Link
      href={`/event/${id}`}
      className="relative flex flex-col w-[275px] h-[300px] rounded-2xl shadow-sm p-4 gap-2 bg-really-light-gray group hover:shadow-md transition-shadow border border-gray-50"
    >
      {/* Image */}
      <div className="w-full h-[165px] relative overflow-hidden rounded-xl bg-gray-200 border border-gray-300">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Title + 3 Dots Menu */}
      <div className="flex justify-between items-start mt-2 relative">
        <h3 className="text-[20px] font-medium text-bcp-blue leading-tight truncate pr-2">
          {title}
        </h3>

        {/* Menu Trigger */}
        {hasMenuActions && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-black hover:bg-gray-100 rounded-full p-0.5 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        )}

        {/* Dropdown Menu */}
        {hasMenuActions && showMenu && (
          <div
            ref={menuRef}
            className="absolute top-8 right-0 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
            onClick={(e) => e.preventDefault()}
          >
            {isAdmin ? (
              // ADMIN MENU
              <>
                {onEdit && (
                  <button
                    onClick={(e) => handleMenuClick(e, onEdit)}
                    className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50 border-b border-gray-100"
                  >
                    Edit Event
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => handleMenuClick(e, onRemove)}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-b border-gray-100"
                  >
                    Remove volunteer from event
                  </button>
                )}
                {onVolunteer && (
                  <button
                    onClick={(e) => handleMenuClick(e, onVolunteer)}
                    className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50"
                  >
                    Volunteer
                  </button>
                )}
              </>
            ) : (
              // USER MENU
              <>
                <button
                  onClick={(e) => handleMenuClick(e, onEdit)}
                  className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50 border-b border-gray-100"
                >
                  Edit sign up
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, onRemove)}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  Cancel sign up
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Time and Location Info */}
      <div className="flex flex-col gap-1 text-[16px] text-black">
        <p className="text-[14px] font-medium text-gray-600 truncate">{positionName}</p>
        <p>{formattedDate}</p>
        <p className="line-clamp-1">{location}</p>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-end mt-auto pb-1">
        <p className="text-[14px] text-gray-500">{timeRange}</p>
        <p className="text-[18px] font-medium text-black">
          {filledSlots}/{totalSlots}
        </p>
      </div>
    </Link>
  );
};

export default ProfileEventCard;
