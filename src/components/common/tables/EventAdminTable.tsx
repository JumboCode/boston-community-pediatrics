"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import { AdminUser } from "@/app/api/eventSignup/controller";
import { SendEmailProps } from "@/lib/email/types";

interface FrontEndUser {
  userId: string;
  signUpId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  selected: boolean;
}

interface EventAdminTableProps {
  position: string;
  startTime: string;
  endTime: string;
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

  // Fetch signups for the position
  const { data: signups } = useSWR<AdminUser[]>(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher
  );

  const frontEndUsers = useMemo(() => {
    if (!signups) return [];

    return signups.map((s) => ({
      signUpId: s.signupId,
      userId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      emailAddress: s.emailAddress,
      phoneNumber: s.phoneNumber,
      selected: false,
    }));
  }, [signups]);

  const [volunteers, setVolunteers] = useState<FrontEndUser[]>([]);
  const router = useRouter();

  useEffect(() => {
    setVolunteers(frontEndUsers);
  }, [frontEndUsers]);

  const toggleSelect = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.signUpId === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers.every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) => ({ ...v, selected: !allSelected }))
    );
  };

  const anySelected = volunteers.some((v) => v.selected);

  const handleDelete = async () => {
    // For each volunteer to delete, call the delete API
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    try {
      // Create an array of delete promises
      const deletePromises = volunteersToDel.map((vol) =>
        fetch(`/api/eventSignup?id=${vol.signUpId}`, {
          method: "DELETE",
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to delete ${vol.userId}`);
          return vol.userId;
        })
      );

      // Wait for all deletes to complete
      const deletedUserIds = await Promise.all(deletePromises);

      // Update local state to remove all deleted volunteers
      setVolunteers((prev) =>
        prev.filter((v) => !deletedUserIds.includes(v.userId))
      );

      router.refresh();
    } catch (error) {
      console.error("Error deleting signups:", error);
    }
  };

  const testEmailProps: SendEmailProps = {
    recipients: ["jlongi01@tufts.edu", "tmaran02@tufts.edu"],
    subject: "DID THIS WORK",
    html: "<strong>It works!</strong>",
  };

  const handleTestEmail = async () => {
    try {
      console.log("SENDING");
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testEmailProps),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Unknown error");

      console.log("Sent:", data);
    } catch (error) {
      console.error("Error testing send email:", error);
    }
  };

  return (
    <div className="min-w-[1100px] flex items-center justify-center p-6">
      <div className="w-full max-w-[996px] bg-white border border-black font-sans">
        {/* Header */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start gap-10 mb-3 px-5 pt-5">
            {/* Left Section */}
            <div
              className="text-[#234254] flex-shrink-0"
              style={{ width: "280px" }}
            >
              <h1 className="text-[24px] font-semibold">{position}</h1>
              <p className="text-[16px] pt-2">
                {location ? location : "No location"}
              </p>
              <p className="text-[16px]">
                {new Date(startTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {new Date(endTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Right Section */}
            <div className="text-[#234254] flex-1 flex flex-col justify-between mb-2">
              <p className="text-[16px] leading-[1.6] mb-5">{description}</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-10 mb-1 px-5">
            <div className="w-[280px] block">
              <p className="text-[24px] w-[280px] block">
                {filledSlots}/{totalSlots} Spots Filled
              </p>
            </div>
            <div className="bg-gray-200 rounded-full h-4 w-full overflow-hidden">
              <div
                className="bg-[#426982] h-4 rounded-full"
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
                key={p.signUpId}
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
                    onChange={() => toggleSelect(p.signUpId)}
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
              <Button
                label="Send Email"
                altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={handleTestEmail}
              />
              <Button
                label="Remove from Event"
                altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleDelete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAdminTable;
