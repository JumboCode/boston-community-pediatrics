"use client";
import React, { useState, useEffect, useMemo } from "react";
import type { EventPosition, EventSignup } from "@prisma/client";
import type { User } from "@prisma/client";
import useSWR from "swr";

interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  selected: boolean;
}

// model User {
//   id            String     @id @default(cuid())
//   clerkId       String     @default("placeholder")
//   firstName     String
//   lastName      String
//   emailAddress  String?    @unique
//   phoneNumber   String
//   dateOfBirth   DateTime?
//   streetAddress String?
//   city          String?
//   state         String?
//   country       String?
//   zipCode       String?
//   hoursWorked   Int         @default(0)
//   createdAt     DateTime   @default(now()) @map("created_at")
//   updatedAt     DateTime   @updatedAt @map("updated_at")
//   role          UserRole

//   signups       EventSignup[]
//   waitlists     EventWaitlist[]

//   @@map("users")
// }

// model EventSignup {
//   id         String       @id @default(cuid())
//   userId     String?      // null if guest signup only
//   eventId    String
//   positionId String
//   hasGuests    Boolean      @default(false)
//   date       DateTime?
//   time       DateTime?
//   notes      String?

//   user       User?        @relation(fields: [userId], references: [id])
//   event      Event        @relation(fields: [eventId], references: [id])
//   position   EventPosition @relation(fields: [positionId], references: [id])
//   guests     Guest[]
// }

interface EventAdminTableProps {
  position: string;
  startTime: Date | string;
  endTime: Date | string;
  description: string;
  filledSlots: number;
  totalSlots: number;
  location: string;
  positionId: string;
}

const EventAdminTable = (props: EventAdminTableProps) => {
  const {
    position, //pos name
    startTime,
    endTime,
    description,
    filledSlots,
    totalSlots,
    location,
    positionId,
  } = props;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // 1. Fetch signups for the position
  const { data: signups, error: signupError } = useSWR<EventSignup[]>(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher
  );
  // 2. Fetch all users
  const { data: users, error: userError } = useSWR<User[]>(
    "/api/users",
    fetcher
  );

  const localUsers: LocalUser[] = useMemo(() => {
    if (!signups || !users) return [];

    // Build map for users
    const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

    return signups.map((s): LocalUser => {
      const u = s.userId ? userMap.get(s.userId) : undefined;

      return {
        id: u?.id ?? "",
        firstName: u?.firstName ?? "",
        lastName: u?.lastName ?? "",
        emailAddress: u?.emailAddress ?? "",
        phoneNumber: u?.phoneNumber ?? "",
        selected: false,
      };
    });
  }, [signups, users]);

  console.log("position: ", position);
  console.log("localUsers:", localUsers);

  const [volunteers, setVolunteers] = useState<LocalUser[]>([]);

  
  useEffect(() => {
    setVolunteers(localUsers);
  }, [localUsers]);

  const toggleSelect = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers.every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) => ({ ...v, selected: !allSelected }))
    );
  };

  const anySelected = volunteers.some((v) => v.selected);

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-[996px] bg-white border border-black font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-3 px-5 pt-5">
          {/* Left Section */}
          <div
            className="text-[#234254] flex-shrink-0"
            style={{ width: "280px" }}
          >
            <h1 className="text-[24px] font-semibold">{position}</h1>
            <p className="text-[16px] pt-2">{location}</p>
            <p className="text-[16px]">
              {startTime.toString()} - {endTime.toString()}
            </p>
            <p className="text-[24px] pt-5">
              {filledSlots}/{totalSlots} Spots Filled
            </p>
          </div>

          {/* Right Section */}
          <div className="text-[#234254] flex-1 flex flex-col justify-between mb-10">
            <p className="text-[16px] leading-[1.6] mb-5">{description}</p>
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-[#234254] h-4 rounded-full"
                style={{
                  width: `${totalSlots ? (filledSlots / totalSlots) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <table className="w-full border-white-700 text-[#234254]">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="text-left">
              <th className="py-3 px-5 font-normal"></th>
              <th className="py-3 pl-29 px-4 font-normal">Name</th>
              <th className="py-3 px-4 font-normal">Email</th>
              <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
              <th className="py-3 px-4 pl-13 font-normal">
                <button
                  onClick={toggleSelectAll}
                  className="hover:underline transition-all duration-200 "
                >
                  Select All
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((p, i) => (
              <tr
                key={p.id}
                className={`border-t border-gray-300 border-b transition-colors duration-200 ${
                  p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
              >
                <td className="py-3 px-6">{i + 1}</td>
                <td className="py-3 px-4 flex items-center gap-15">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  {p.firstName} {p.lastName}
                </td>
                <td className="py-3 px-4">{p.emailAddress}</td>
                <td className="py-3 px-4">{p.phoneNumber}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={p.selected}
                    onChange={() => toggleSelect(p.id)}
                    className="w-5 h-5 accent-[#234254] cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Selection Buttons */}
        {anySelected && (
          <div className="border-t border-gray-200 bg-gray-50 w-full">
            <div className="flex justify-between px-6 py-4">
              <button className="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]">
                Send Email
              </button>
              <button className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400">
                Remove from Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAdminTable;
