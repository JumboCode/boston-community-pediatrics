"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import { AdminUser } from "@/app/api/eventSignup/controller";

interface FrontEndUser {
  userId: string;
  signUpId?: string;
  waitlistId?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  selected: boolean;
  guestOf?: string;
  isGuest?: boolean; // ← ADD THIS LINE
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
  isAdmin?: boolean; // Add this prop to control waitlist visibility
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
    isAdmin = false, // Default to false if not provided
  } = props;

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  };

  // Fetch signups for the position (volunteers)
  const { data: signups } = useSWR<AdminUser[]>(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher
  );

  // Fetch waitlist ONLY if user is admin
  const { data: waitlistSignups } = useSWR<AdminUser[]>(
    positionId && isAdmin ? `/api/waitlist?positionId=${positionId}` : null,
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
      guestOf: s.guestOf,
      isGuest: s.isGuest, // ← ADD THIS LINE
    }));
  }, [signups]);

  // Convert waitlistSignups -> FrontEndUser[]
  const frontEndWaitlistUsers = useMemo(() => {
    if (!waitlistSignups || !Array.isArray(waitlistSignups)) return [];

    return waitlistSignups.map((s) => ({
      userId: s.userId,
      waitlistId: s.waitlistId,
      firstName: s.firstName,
      lastName: s.lastName,
      emailAddress: s.emailAddress,
      phoneNumber: s.phoneNumber,
      selected: false,
      guestOf: s.guestOf,
      isGuest: s.isGuest, // ← ADD THIS LINE
    }));
  }, [waitlistSignups]);

  const [volunteers, setVolunteers] = useState<FrontEndUser[]>([]);
  const [waitlist, setWaitlist] = useState<FrontEndUser[]>([]);

  const router = useRouter();

  useEffect(() => {
    setVolunteers(frontEndUsers);
  }, [frontEndUsers]);

  useEffect(() => {
    setWaitlist(frontEndWaitlistUsers);
  }, [frontEndWaitlistUsers]);

  // Volunteer selection - UPDATED to select guests with parent
  const toggleSelect = (id?: string) => {
    if (!id) return;

    setVolunteers((prev) => {
      // Find the clicked item
      const clickedItem = prev.find((v) => v.signUpId === id);
      if (!clickedItem) return prev;

      const newSelectedState = !clickedItem.selected;

      return prev.map((v) => {
        // If this is the clicked item, toggle it
        if (v.signUpId === id && !v.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        // If this is a guest of the clicked item, also toggle it
        if (v.signUpId === id && v.isGuest && !clickedItem.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        // Otherwise leave it unchanged
        return v;
      });
    });
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers.every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) => ({ ...v, selected: !allSelected }))
    );
  };

  const anySelected = volunteers.some((v) => v.selected);

  // Waitlist selection handlers - UPDATED to select guests with parent
  const toggleWaitlistSelect = (id: string) => {
    setWaitlist((prev) => {
      // Find the clicked item
      const clickedItem = prev.find((v) => v.waitlistId === id);
      if (!clickedItem) return prev;

      const newSelectedState = !clickedItem.selected;

      return prev.map((v) => {
        // If this is the clicked item, toggle it
        if (v.waitlistId === id && !v.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        // If this is a guest of the clicked item, also toggle it
        if (v.waitlistId === id && v.isGuest && !clickedItem.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        // Otherwise leave it unchanged
        return v;
      });
    });
  };

  const toggleWaitlistSelectAll = () => {
    const allSelected = waitlist.every((v) => v.selected);
    setWaitlist((prev) => prev.map((v) => ({ ...v, selected: !allSelected })));
  };

  const anyWaitlistSelected = waitlist.some((v) => v.selected);

  // Remove from event - FIXED to deduplicate signup IDs
  const handleDelete = async () => {
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToDel.length === 0) return;

    try {
      // Get unique signup IDs (since guests share the same ID as their parent)
      const uniqueSignupIds = [
        ...new Set(volunteersToDel.map((vol) => vol.signUpId).filter(Boolean)),
      ];

      const deletePromises = uniqueSignupIds.map(async (signUpId) => {
        const res = await fetch(`/api/eventSignup?id=${signUpId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error(`Failed to remove from event`);
        }

        return signUpId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state (both parents and guests)
      setVolunteers((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to remove from event`);
    }
  };

  // Remove from waitlist frontend action - FIXED to deduplicate waitlist IDs
  const handleWaitlistDelete = async () => {
    const waitlistToDel: FrontEndUser[] = waitlist.filter((v) => v.selected);

    if (waitlistToDel.length === 0) return;

    try {
      // Get unique waitlist IDs (since guests share the same ID as their parent)
      const uniqueWaitlistIds = [
        ...new Set(waitlistToDel.map((vol) => vol.waitlistId).filter(Boolean)),
      ];

      const deletePromises = uniqueWaitlistIds.map(async (waitlistId) => {
        const res = await fetch(`/api/waitlist?id=${waitlistId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error(`Failed to delete from waitlist`);
        }

        return waitlistId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state (both parents and guests)
      setWaitlist((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to delete from waitlist`);
    }
  };

  // Add to Event (move selected waitlist users into volunteers)
  const handleAddToEvent = async () => {
    const selectedWaitlist = waitlist.filter((w) => w.selected);
    if (selectedWaitlist.length === 0) return;

    const waitlistIds = selectedWaitlist.map((w) => w.waitlistId);

    try {
      const response = await fetch("/api/waitlist/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId, waitlistIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to promote waitlist users");
      }

      // Optimistic UI update
      setVolunteers((prev) => [
        ...prev,
        ...selectedWaitlist.map((w) => ({
          ...w,
          selected: false,
          waitlistId: undefined,
          signUpId: w.waitlistId, // Temporarily use waitlistId, will be replaced on refresh
        })),
      ]);
      setWaitlist((prev) => prev.filter((w) => !w.selected));

      router.refresh();
    } catch (error) {
      console.error("Error promoting waitlist users:", error);
      // Revert optimistic update on error
      router.refresh();
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
            {volunteers.map((p, i) => {
              // Check if next person is a guest of this person
              const nextPerson = volunteers[i + 1];
              const hasGuestBelow =
                nextPerson && nextPerson.guestOf && !p.isGuest;

              // Sequential numbering for ALL people (users + guests)
              const rowNumber = i + 1;

              return (
                <tr
                  key={p.signUpId + (p.isGuest ? `-guest-${p.userId}` : "")}
                  className={`transition-colors duration-200 ${
                    p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                  } ${!p.isGuest ? "border-t border-gray-300" : ""} ${
                    !hasGuestBelow && !p.isGuest
                      ? "border-b border-gray-300"
                      : ""
                  } ${p.isGuest && !volunteers[i + 1]?.isGuest ? "border-b border-gray-300" : ""}`}
                >
                  <td className="py-3 px-6">{rowNumber}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.isGuest ? (
                        <div className="flex items-start relative">
                          {/* Vertical connector line - 30px tall, 5px wide, #D9D9D9 */}
                          <div
                            className="absolute left-[17.5px] -top-[30px] w-[5px] h-[30px]"
                            style={{ backgroundColor: "#D9D9D9" }}
                          ></div>
                          {/* Guest circle - #D9D9D9 */}
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0 relative z-10"
                            style={{ backgroundColor: "#D9D9D9" }}
                          ></div>
                          <div className="ml-3">
                            <div>
                              {p.firstName} {p.lastName}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 relative">
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0 relative z-10"
                            style={{ backgroundColor: "#D9D9D9" }}
                          ></div>
                          {/* Vertical line extending down - 30px tall, 5px wide, #D9D9D9 */}
                          {hasGuestBelow && (
                            <div
                              className="absolute left-[17.5px] top-[40px] w-[5px] h-[30px]"
                              style={{ backgroundColor: "#D9D9D9" }}
                            ></div>
                          )}
                          <div>
                            {p.firstName} {p.lastName}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{p.emailAddress}</td>
                  <td className="py-3 px-4">{p.phoneNumber}</td>
                  <td className="py-3 px-4 text-center">
                    {/* Only show checkbox for main users, not guests */}
                    {!p.isGuest && (
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.signUpId)}
                        className="w-5 h-5 accent-[#234254] cursor-pointer"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Selection Buttons */}
        {anySelected && (
          <div className="border-t border-gray-200 bg-gray-50 w-full">
            <div className="flex justify-between px-6 py-4">
              <Button
                label="Send Email"
                altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
              />
              <Button
                label="Remove from Event"
                altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleDelete}
              />
            </div>
          </div>
        )}

        {/* WAITLIST SECTION - Only show if admin */}
        {isAdmin && (
          <>
            <div className="px-5 pt-10">
              <h1 className="text-[#234254] text-[24px] font-semibold">
                Waitlist: {waitlist.length} Waiting
              </h1>
            </div>

            <table className="w-full border-white-700 text-[#234254]">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="py-3 px-5 font-normal"></th>
                  <th className="py-3 pl-29 px-4 font-normal">Name</th>
                  <th className="py-3 px-4 font-normal">Email</th>
                  <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
                  <th className="py-3 px-4 pl-13 font-normal">
                    <button
                      onClick={toggleWaitlistSelectAll}
                      className="hover:underline transition-all duration-200 "
                    >
                      Select All
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((p, i) => {
                  // Check if next person is a guest of this person
                  const nextPerson = waitlist[i + 1];
                  const hasGuestBelow =
                    nextPerson && nextPerson.guestOf && !p.isGuest;

                  // Sequential numbering for ALL people (users + guests)
                  const rowNumber = i + 1;

                  return (
                    <tr
                      key={
                        p.waitlistId + (p.isGuest ? `-guest-${p.userId}` : "")
                      }
                      className={`transition-colors duration-200 ${
                        p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                      } ${!p.isGuest ? "border-t border-gray-300" : ""} ${
                        !hasGuestBelow && !p.isGuest
                          ? "border-b border-gray-300"
                          : ""
                      } ${p.isGuest && !waitlist[i + 1]?.isGuest ? "border-b border-gray-300" : ""}`}
                    >
                      <td className="py-3 px-6">{rowNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.isGuest ? (
                            <div className="flex items-start relative">
                              {/* Vertical connector line - 30px tall, 5px wide, #D9D9D9 */}
                              <div
                                className="absolute left-[17.5px] -top-[30px] w-[5px] h-[30px]"
                                style={{ backgroundColor: "#D9D9D9" }}
                              ></div>
                              {/* Guest circle - #D9D9D9 */}
                              <div
                                className="w-10 h-10 rounded-full flex-shrink-0 relative z-10"
                                style={{ backgroundColor: "#D9D9D9" }}
                              ></div>
                              <div className="ml-3">
                                <div>
                                  {p.firstName} {p.lastName}
                                </div>
                                {p.guestOf && (
                                  <div className="text-sm text-gray-500 italic">
                                    Guest of {p.guestOf}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 relative">
                              <div
                                className="w-10 h-10 rounded-full flex-shrink-0 relative z-10"
                                style={{ backgroundColor: "#D9D9D9" }}
                              ></div>
                              {/* Vertical line extending down - 30px tall, 5px wide, #D9D9D9 */}
                              {hasGuestBelow && (
                                <div
                                  className="absolute left-[17.5px] top-[40px] w-[5px] h-[30px]"
                                  style={{ backgroundColor: "#D9D9D9" }}
                                ></div>
                              )}
                              <div>
                                {p.firstName} {p.lastName}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{p.emailAddress}</td>
                      <td className="py-3 px-4">{p.phoneNumber}</td>
                      <td className="py-3 px-4 text-center">
                        {/* Only show checkbox for main users */}
                        {!p.isGuest && (
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={() => toggleWaitlistSelect(p.waitlistId!)}
                            className="w-5 h-5 accent-[#234254] cursor-pointer"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* WAITLIST BUTTONS (includes Add to Event) */}
            {anyWaitlistSelected && (
              <div className="border-t border-gray-200 bg-gray-50 w-full">
                <div className="flex justify-between px-6 py-4">
                  <div className="flex gap-3">
                    <Button
                      label="Send Email"
                      altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                    />
                    <Button
                      label="Add to Event"
                      altStyle="bg-white border border-[#234254] text-[#234254] px-5 py-2 rounded-md shadow hover:bg-gray-50"
                      onClick={handleAddToEvent}
                    />
                  </div>

                  <Button
                    label="Remove from Waitlist"
                    altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                    onClick={handleWaitlistDelete}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventAdminTable;
