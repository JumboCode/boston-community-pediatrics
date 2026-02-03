"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface EventCardProps {
  image: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  date: Date;
  id: string;
  onEdit?: () => void;
  onRemove?: () => void;
  onVolunteer?: () => void;
}

const EventCard = ({
  image,
  title,
  startTime,
  endTime,
  location,
  date,
  id,
  onEdit,
  onRemove,
  onVolunteer,
}: EventCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return d
      .toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/ (AM|PM)/, "");
  };

  const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });

  const handleMenuClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (action) action();
    setShowMenu(false);
  };

  return (
    <Link
      href={`/event/${id}`}
      className="relative flex flex-col w-[305px] h-[330px] rounded-2xl shadow-sm p-4 gap-2 bg-white group hover:shadow-md transition-shadow border border-gray-50"
    >
      {/* Image */}
      <div className="w-full h-[165px] relative overflow-hidden rounded-xl bg-gray-200">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Title + 3 Dots Menu */}
      <div className="flex justify-between items-start mt-2 relative">
        <h3 className="text-[20px] font-medium text-[#426982] leading-tight truncate pr-2">
          {title}
        </h3>
        
        {/* Menu Trigger */}
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

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute top-8 right-0 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden"
          >
            <button onClick={(e) => handleMenuClick(e, onEdit)} className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50 border-b border-gray-50">
              Edit
            </button>
            <button onClick={(e) => handleMenuClick(e, onRemove)} className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50 border-b border-gray-50">
              Remove
            </button>
            <button onClick={(e) => handleMenuClick(e, onVolunteer)} className="w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50">
              Volunteer
            </button>
          </div>
        )}
      </div>

      {/* Time and Location Info */}
      <div className="flex flex-col gap-1 text-[16px] text-black">
        <p>{timeRange}</p>
        <p className="line-clamp-1">{location}</p>
      </div>
      
      {/* Bottom Footer */}
      <div className="flex justify-between items-end mt-auto pb-1">
         <p className="text-[14px] text-gray-500">{formattedDate}</p>
         <p className="text-[18px] font-medium text-black">00/00 sign ups</p>
      </div>
    </Link>
  );
};

export default EventCard;